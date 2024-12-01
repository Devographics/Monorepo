import { ReactNode } from "react";

export interface NextPageParams<TParams = any, TSearchParams = any> {
  params: Promise<TParams>;
  searchParams: Promise<Partial<TSearchParams>>;
}
export interface NextLayoutParams<TParams = any> {
  params: Promise<TParams>;
  children: ReactNode;
}
