import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
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

// 로깅 링크 설정
const loggingLink = new ApolloLink((operation, forward) => {
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
});

const httpLink = createHttpLink({
  uri: "/api/graphql",
});

const authLink = setContext((_, { headers }) => {
  // 로컬 스토리지에서 직접 토큰을 가져옵니다
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  console.log("인증 토큰:", token ? "토큰 있음" : "토큰 없음");
  return {
    headers: {
      ...headers,
      token: token ? `${token}` : "",
    },
  };
});

// 아폴로 클라이언트 생성
const client = new ApolloClient({
  link: from([errorLink, loggingLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

export default client;
