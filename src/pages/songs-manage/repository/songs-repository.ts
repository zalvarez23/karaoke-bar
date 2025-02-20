import { TVisitResponseDto } from "@/shared/types/visit-types";

export interface ISongsRepository {
  getAllSongsOnSnapshot(
    callback: (songs: TVisitResponseDto) => void,
  ): () => void;
}
