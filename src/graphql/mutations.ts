import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($userId: String!, $password: String!, $deviceId: String) {
    login(userId: $userId, password: $password, deviceId: $deviceId) {
      success
      token
      message
    }
  }
`;

export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($accessToken: String!) {
    loginWithGoogle(accessToken: $accessToken) {
      success
      message
      token
      user {
        id
        userId
        email
        phoneNumber
        profile
        isAdmin
        isBusiness
        createdAt
        updatedAt
        point
        providers {
          id
          provider
          socialId
          email
          createdAt
          updatedAt
        }
      }
    }
  }
`;
