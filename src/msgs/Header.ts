import { Time } from "@foxglove/schemas";

export type Header = {
  stamp: Time;
  frame_id: string;
};
