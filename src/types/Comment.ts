export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
  displayName: string;
  photoURL: string | null;
}
