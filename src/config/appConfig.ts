export type AppConfig = {
  enableSignUp: boolean;
  enableCart: boolean;
  enableReview: boolean;
  enablePromotion: boolean;
  enableOpenMarket: boolean;
};

export const appConfig: AppConfig = {
  enableSignUp: true,
  enableCart: true,
  enableReview: false,
  enablePromotion: true,
  enableOpenMarket: true,
};
