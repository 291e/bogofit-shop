import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { ApolloLink } from "@apollo/client";

// 에러 처리 링크 설정
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL 오류]: 메시지: ${message}, 위치: ${JSON.stringify(
          locations
        )}, 경로: ${path}, 코드: ${extensions?.code}`
      );
    });
  }

  if (networkError) {
    console.error(`[네트워크 오류]: ${networkError.message}`, networkError);
  }
});

// 로깅 링크 설정 - 개발 환경에서만 활성화
const loggingLink = new ApolloLink((operation, forward) => {
  // 개발 환경에서만 로깅
  if (process.env.NODE_ENV === "development") {
    const startTime = new Date().getTime();

    console.log(`[GraphQL 요청] 작업: ${operation.operationName}`, {
      variables: operation.variables,
      query: operation.query.loc?.source.body,
    });

    return forward(operation).map((response) => {
      const endTime = new Date().getTime();
      const duration = endTime - startTime;

      console.log(
        `[GraphQL 응답] 작업: ${operation.operationName}, 소요시간: ${duration}ms`,
        {
          data: response.data,
          errors: response.errors,
        }
      );

      return response;
    });
  }

  // 프로덕션 환경에서는 로깅 없이 진행
  return forward(operation);
});

const httpLink = createHttpLink({
  uri: "/api/graphql",
  // SSR과 CSR 간의 일관성을 위해 credentials 설정
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  // 로컬 스토리지에서 직접 토큰을 가져옵니다
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  console.log("🔐 Apollo authLink:", {
    hasToken: !!token,
    tokenLength: token?.length || 0,
  });

  return {
    headers: {
      ...headers,
      token: token ? `${token}` : "",
    },
  };
});

// 클라이언트 사이드에서만 사용할 싱글톤 인스턴스
let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

// Apollo 클라이언트 생성 함수
function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // SSR 모드 설정
    link: from([errorLink, loggingLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      mutate: {
        errorPolicy: "all",
      },
      query: {
        errorPolicy: "all",
        // SSR과 CSR 간의 일관성을 위한 설정
        fetchPolicy:
          typeof window === "undefined" ? "network-only" : "cache-first",
      },
    },
    // 하이드레이션 불일치 방지를 위한 설정
    connectToDevTools:
      typeof window !== "undefined" && process.env.NODE_ENV === "development",
  });
}

// 클라이언트 인스턴스 초기화 함수
export function initializeApollo(
  initialState: NormalizedCacheObject | null = null
) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // 초기 상태가 있으면 클라이언트 상태와 병합
  if (initialState) {
    // 기존 캐시 데이터 가져오기
    const existingCache = _apolloClient.cache.extract();

    // 새 캐시 데이터 병합
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  // SSR인 경우 매번 새 클라이언트 생성
  if (typeof window === "undefined") return _apolloClient;

  // 클라이언트 사이드에서는 싱글톤 사용
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

// 싱글톤 인스턴스 내보내기
const client = initializeApollo();
export default client;
