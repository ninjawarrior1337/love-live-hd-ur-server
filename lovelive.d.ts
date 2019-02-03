type rarity = "N" | "R" | "SR" | "SSR" | "UR";
type attribute = "Smile" | "Pure" | "Cool" | "All";

export interface MiniEvent {
  japanese_name: string;
  english_name: string;
  translated_name: string;
  image: string;
}

export interface MiniIdol {
  name: string;
  school: string;
  year: string;
  main_unit: string;
  japanese_name: string;
  sub_unit: string;
}

export interface URPair {
  card: Card;
  reverse_display_idolized: string;
  reverse_display: string;
}

export interface Card {
  id: number;
  idol: MiniIdol;
  rarity: rarity;
  attribute: attribute;
  japanese_collection: string;
  translated_collection: string;
  japanese_attribute: string;
  is_promo: boolean;
  promo_item: String;
  promo_link: string;
  release_date: Date;
  japan_only: boolean;
  event: MiniEvent;
  is_special: boolean;
  hp: number;
  skill: string;
  card_image: string;
  card_idolized_image: string;
  transparent_image: string;
  transparent_idolized_image: string;
  clean_ur: string;
  clean_ur_idolized: string;
  ur_pair: URPair;
}
