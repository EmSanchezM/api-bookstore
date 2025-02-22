import Surreal from "surrealdb";
import { defineAuthor } from "./author.table";
import { defineBook } from "./book.table";
import { defineCustomer } from "./customer.table";
import { defineLanguage } from "./language.table";
import { definePublisher } from "./publisher.table";

export const defineTables = async(db: Surreal) => {
  await defineAuthor(db);
  await defineBook(db);
  await defineCustomer(db);
  await defineLanguage(db);
  await definePublisher(db);
};