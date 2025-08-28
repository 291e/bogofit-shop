import { gql } from "@apollo/client";

export const GET_MY_INFO = gql`
  query GetMyInfo {
    getMyInfo {
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
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers($offset: Int) {
    getAllUsers(offset: $offset) {
      id
      userId
      email
      phoneNumber
      profile
    }
  }
`;
