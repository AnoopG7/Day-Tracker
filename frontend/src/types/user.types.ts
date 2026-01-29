/** User interface - shared across the application */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}
