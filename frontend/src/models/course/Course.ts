export default interface Course {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  dateCreated: Date;
}
