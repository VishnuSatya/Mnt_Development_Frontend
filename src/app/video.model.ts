export interface Comment {
  user?: { name: string; email: string };  // <-- optional
  text: string;
  createdAt: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  filePath: string;
  uploadedBy?: { name: string; email: string };  // <-- optional
  views: number;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
  createdAt: string;
}
