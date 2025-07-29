export interface Address {
  description: string;
  street: string;
  city: string;
  country: string;
  zone: string;
}

export interface ProfileDto {
  email: string;
  imageUrl?: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  addresses: Address[];
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  imageUrl?: string;
  addresses: Address[];
}
