"use client";

// `dataProvider` is the OTHER Refine convention (alongside `authProvider`).
// It's the object Refine's data hooks (useTable, useForm, useOne, ...) call
// to actually fetch/create/update/delete records. Instead of hand-writing
// one, we use the official `@refinedev/simple-rest` provider, which already
// knows how to turn Refine's internal calls into the REST calls a plain
// Express API understands:
//
//   getList  -> GET  /leads?_start=&_end=&_sort=&_order=
//   getOne   -> GET  /leads/:id
//   create   -> POST /leads
//   update   -> PATCH /leads/:id
//   deleteOne -> DELETE /leads/:id
//
// Our Express routes were written to match these conventions on purpose
// (see server/routes/leads.js), so this is mostly "off the shelf".
import dataProviderSimpleRest, { axiosInstance } from "@refinedev/simple-rest";

export const API_URL = "http://localhost:8001";

// GOTCHA (cost real debugging time when this was first wired up): the
// simple-rest provider does NOT know about our `authProvider` or its JWT —
// they're two completely separate objects. Without this interceptor, every
// /leads request goes out with no Authorization header, the Express
// `requireAuth` middleware 401s it, and `authProvider.onError` immediately
// logs the user out — which looks like "creating a lead sends me back to
// the login page" with no obvious cause.
//
// Axios interceptors run on every outgoing request made through this
// instance, so this is the one place we need to attach the token.
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { axiosInstance };
export const dataProvider = dataProviderSimpleRest(API_URL, axiosInstance);
