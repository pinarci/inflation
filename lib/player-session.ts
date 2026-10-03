export const PLAYER_IDENTITY_COOKIE = "username";
export const INTEREST_STORAGE_KEY = "gameState";
export const MONEY_STORAGE_KEY = "moneyState";
export const PLAYER_GAME_STORAGE_KEYS = [
  INTEREST_STORAGE_KEY,
  MONEY_STORAGE_KEY,
] as const;
