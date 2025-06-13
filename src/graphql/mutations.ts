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

export const LOGIN_WITH_KAKAO = gql`
  mutation LoginWithKakao($accessToken: String!) {
    loginWithKakao(accessToken: $accessToken) {
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

export const LOGIN_WITH_APPLE = gql`
  mutation LoginWithApple($accessToken: String!) {
    loginWithApple(accessToken: $accessToken) {
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

export const RESET_PASSWORD = gql`
  mutation ResetPassword($userId: String!, $email: String!) {
    resetPassword(userId: $userId, email: $email) {
      success
      message
    }
  }
`;

export const EDIT_PROFILE = gql`
  mutation EditProfile($email: String!, $password: String!, $profile: String!) {
    editProfile(email: $email, password: $password, profile: $profile) {
      success
      message
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

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($userId: String!, $password: String!) {
    deleteAccount(userId: $userId, password: $password) {
      success
      message
      user {
        id
        userId
        email
        phoneNumber
        profile
      }
    }
  }
`;

export const CREATE_ACCOUNT = gql`
  mutation CreateAccount(
    $userId: String!
    $password: String!
    $email: String!
  ) {
    createAccount(userId: $userId, password: $password, email: $email) {
      success
      message
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
