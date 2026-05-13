export type TrackDTO = {
  id: string;
  title: string;
  artist: string;
  audioPath: string;
  coverPath: string | null;
  sortOrder: number;
  createdAt: string;
};
