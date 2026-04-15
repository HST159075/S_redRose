// src/server.ts
import "dotenv/config";

// src/app.js
import express from "express";
import cors from "cors";
import path3 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import fs from "fs";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.js
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.js
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.js
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.6.0",
  "engineVersion": "75cbdc1eb7150937890ad5465d861175c6624711",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id            String   @id @default(cuid())\n  name          String\n  email         String   @unique\n  emailVerified Boolean  @default(false)\n  image         String?\n  role          Role     @default(USER)\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n\n  sessions Session[]\n  accounts Account[]\n  orders   Order[]\n  reviews  Review[]\n  cart     Cart?\n\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id @default(cuid())\n  userId    String\n  token     String   @unique\n  expiresAt DateTime\n  ipAddress String?\n  userAgent String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id @default(cuid())\n  userId                String\n  accountId             String\n  providerId            String\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id @default(cuid())\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@map("verification")\n}\n\n// \u2500\u2500\u2500 App Tables \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\nmodel Category {\n  id        String   @id @default(cuid())\n  name      String   @unique\n  slug      String   @unique\n  image     String?\n  createdAt DateTime @default(now())\n\n  products Product[]\n\n  @@map("category")\n}\n\nmodel Product {\n  id           String   @id @default(cuid())\n  name         String\n  slug         String   @unique\n  description  String?\n  regularPrice Float\n  salePrice    Float?\n  mainImg      String\n  hoverImg     String?\n  stock        Int      @default(0)\n  isActive     Boolean  @default(true)\n  categoryId   String?\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  category   Category?   @relation(fields: [categoryId], references: [id])\n  reviews    Review[]\n  cartItems  CartItem[]\n  orderItems OrderItem[]\n\n  @@map("product")\n}\n\nmodel Cart {\n  id        String   @id @default(cuid())\n  userId    String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)\n  items CartItem[]\n\n  @@map("cart")\n}\n\nmodel CartItem {\n  id        String @id @default(cuid())\n  cartId    String\n  productId String\n  quantity  Int    @default(1)\n\n  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)\n  product Product @relation(fields: [productId], references: [id])\n\n  @@unique([cartId, productId])\n  @@map("cart_item")\n}\n\nmodel Order {\n  id            String        @id @default(cuid())\n  userId        String\n  totalAmount   Float\n  status        OrderStatus   @default(PENDING)\n  paymentMethod PaymentMethod @default(CASH_ON_DELIVERY)\n  paymentStatus PaymentStatus @default(UNPAID)\n  address       String\n  city          String\n  postalCode    String?\n  phone         String\n  note          String?\n  createdAt     DateTime      @default(now())\n  updatedAt     DateTime      @updatedAt\n\n  user  User        @relation(fields: [userId], references: [id])\n  items OrderItem[]\n\n  @@map("order")\n}\n\nmodel OrderItem {\n  id        String @id @default(cuid())\n  orderId   String\n  productId String\n  quantity  Int\n  price     Float\n\n  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  product Product @relation(fields: [productId], references: [id])\n\n  @@map("order_item")\n}\n\nmodel Review {\n  id        String   @id @default(cuid())\n  userId    String\n  productId String\n  rating    Int\n  comment   String?\n  createdAt DateTime @default(now())\n\n  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, productId])\n  @@map("review")\n}\n\nenum Role {\n  USER\n  ADMIN\n}\n\nenum OrderStatus {\n  PENDING\n  CONFIRMED\n  PROCESSING\n  SHIPPED\n  DELIVERED\n  CANCELLED\n}\n\nenum PaymentMethod {\n  CASH_ON_DELIVERY\n}\n\nenum PaymentStatus {\n  UNPAID\n  PAID\n  REFUNDED\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"products","kind":"object","type":"Product","relationName":"CategoryToProduct"}],"dbName":"category"},"Product":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"regularPrice","kind":"scalar","type":"Float"},{"name":"salePrice","kind":"scalar","type":"Float"},{"name":"mainImg","kind":"scalar","type":"String"},{"name":"hoverImg","kind":"scalar","type":"String"},{"name":"stock","kind":"scalar","type":"Int"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToProduct"},{"name":"reviews","kind":"object","type":"Review","relationName":"ProductToReview"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToProduct"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderItemToProduct"}],"dbName":"product"},"Cart":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"CartToUser"},{"name":"items","kind":"object","type":"CartItem","relationName":"CartToCartItem"}],"dbName":"cart"},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"cartId","kind":"scalar","type":"String"},{"name":"productId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToCartItem"},{"name":"product","kind":"object","type":"Product","relationName":"CartItemToProduct"}],"dbName":"cart_item"},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"totalAmount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"paymentMethod","kind":"enum","type":"PaymentMethod"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"address","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"postalCode","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"}],"dbName":"order"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"productId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"price","kind":"scalar","type":"Float"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"product","kind":"object","type":"Product","relationName":"OrderItemToProduct"}],"dbName":"order_item"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"productId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"product","kind":"object","type":"Product","relationName":"ProductToReview"}],"dbName":"review"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","order","products","_count","category","product","reviews","items","cart","cartItems","orderItems","orders","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Product.findUnique","Product.findUniqueOrThrow","Product.findFirst","Product.findFirstOrThrow","Product.findMany","Product.createOne","Product.createMany","Product.createManyAndReturn","Product.updateOne","Product.updateMany","Product.updateManyAndReturn","Product.upsertOne","Product.deleteOne","Product.deleteMany","_avg","_sum","Product.groupBy","Product.aggregate","Cart.findUnique","Cart.findUniqueOrThrow","Cart.findFirst","Cart.findFirstOrThrow","Cart.findMany","Cart.createOne","Cart.createMany","Cart.createManyAndReturn","Cart.updateOne","Cart.updateMany","Cart.updateManyAndReturn","Cart.upsertOne","Cart.deleteOne","Cart.deleteMany","Cart.groupBy","Cart.aggregate","CartItem.findUnique","CartItem.findUniqueOrThrow","CartItem.findFirst","CartItem.findFirstOrThrow","CartItem.findMany","CartItem.createOne","CartItem.createMany","CartItem.createManyAndReturn","CartItem.updateOne","CartItem.updateMany","CartItem.updateManyAndReturn","CartItem.upsertOne","CartItem.deleteOne","CartItem.deleteMany","CartItem.groupBy","CartItem.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","AND","OR","NOT","id","userId","productId","rating","comment","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","orderId","quantity","price","totalAmount","OrderStatus","status","PaymentMethod","paymentMethod","PaymentStatus","paymentStatus","address","city","postalCode","phone","note","updatedAt","cartId","every","some","none","name","slug","description","regularPrice","salePrice","mainImg","hoverImg","stock","isActive","categoryId","image","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","Role","role","cartId_productId","userId_productId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "pgVosAEQBAAA6AIAIAUAAOkCACALAADrAgAgDQAA7AIAIBAAAOoCACDJAQAA5QIAMMoBAAAxABDLAQAA5QIAMMwBAQAAAAHRAUAAywIAIewBQADLAgAh8QEBANsCACH7AQEA1wIAIYsCAQAAAAGMAiAA5gIAIY4CAADnAo4CIgEAAAABACAMAwAAzAIAIMkBAACBAwAwygEAAAMAEMsBAACBAwAwzAEBANsCACHNAQEA2wIAIdEBQADLAgAh7AFAAMsCACH-AUAAywIAIYgCAQDbAgAhiQIBANcCACGKAgEA1wIAIQMDAADOAwAgiQIAAIIDACCKAgAAggMAIAwDAADMAgAgyQEAAIEDADDKAQAAAwAQywEAAIEDADDMAQEAAAABzQEBANsCACHRAUAAywIAIewBQADLAgAh_gFAAMsCACGIAgEAAAABiQIBANcCACGKAgEA1wIAIQMAAAADACABAAAEADACAAAFACARAwAAzAIAIMkBAAD_AgAwygEAAAcAEMsBAAD_AgAwzAEBANsCACHNAQEA2wIAIdEBQADLAgAh7AFAAMsCACH_AQEA2wIAIYACAQDbAgAhgQIBANcCACGCAgEA1wIAIYMCAQDXAgAhhAJAAIADACGFAkAAgAMAIYYCAQDXAgAhhwIBANcCACEIAwAAzgMAIIECAACCAwAgggIAAIIDACCDAgAAggMAIIQCAACCAwAghQIAAIIDACCGAgAAggMAIIcCAACCAwAgEQMAAMwCACDJAQAA_wIAMMoBAAAHABDLAQAA_wIAMMwBAQAAAAHNAQEA2wIAIdEBQADLAgAh7AFAAMsCACH_AQEA2wIAIYACAQDbAgAhgQIBANcCACGCAgEA1wIAIYMCAQDXAgAhhAJAAIADACGFAkAAgAMAIYYCAQDXAgAhhwIBANcCACEDAAAABwAgAQAACAAwAgAACQAgEgMAAMwCACAMAAD4AgAgyQEAAPsCADDKAQAACwAQywEAAPsCADDMAQEA2wIAIc0BAQDbAgAh0QFAAMsCACHgAQgA9QIAIeIBAAD8AuIBIuQBAAD9AuQBIuYBAAD-AuYBIucBAQDbAgAh6AEBANsCACHpAQEA1wIAIeoBAQDbAgAh6wEBANcCACHsAUAAywIAIQQDAADOAwAgDAAA5AQAIOkBAACCAwAg6wEAAIIDACASAwAAzAIAIAwAAPgCACDJAQAA-wIAMMoBAAALABDLAQAA-wIAMMwBAQAAAAHNAQEA2wIAIdEBQADLAgAh4AEIAPUCACHiAQAA_ALiASLkAQAA_QLkASLmAQAA_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_gFAAIsDACGIAgEAiAMAIYkCAQCKAwAhigIBAIoDACECAAAABQAgFgAAUQAgCMwBAQCIAwAhzQEBAIgDACHRAUAAiwMAIewBQACLAwAh_gFAAIsDACGIAgEAiAMAIYkCAQCKAwAhigIBAIoDACECAAAAAwAgFgAAUwAgAgAAAAMAIBYAAFMAIAMAAAAFACAdAABMACAeAABRACABAAAABQAgAQAAAAMAIAUIAACYBAAgIwAAmgQAICQAAJkEACCJAgAAggMAIIoCAACCAwAgC8kBAADgAgAwygEAAFoAEMsBAADgAgAwzAEBAK0CACHNAQEArQIAIdEBQACwAgAh7AFAALACACH-AUAAsAIAIYgCAQCtAgAhiQIBAK8CACGKAgEArwIAIQMAAAADACABAABZADAiAABaACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAOAwAAlwQAIMwBAQAAAAHNAQEAAAAB0QFAAAAAAewBQAAAAAH_AQEAAAABgAIBAAAAAYECAQAAAAGCAgEAAAABgwIBAAAAAYQCQAAAAAGFAkAAAAABhgIBAAAAAYcCAQAAAAEBFgAAYgAgDcwBAQAAAAHNAQEAAAAB0QFAAAAAAewBQAAAAAH_AQEAAAABgAIBAAAAAYECAQAAAAGCAgEAAAABgwIBAAAAAYQCQAAAAAGFAkAAAAABhgIBAAAAAYcCAQAAAAEBFgAAZAAwARYAAGQAMA4DAACWBAAgzAEBAIgDACHNAQEAiAMAIdEBQACLAwAh7AFAAIsDACH_AQEAiAMAIYACAQCIAwAhgQIBAIoDACGCAgEAigMAIYMCAQCKAwAhhAJAAJUEACGFAkAAlQQAIYYCAQCKAwAhhwIBAIoDACECAAAACQAgFgAAZwAgDcwBAQCIAwAhzQEBAIgDACHRAUAAiwMAIewBQACLAwAh_wEBAIgDACGAAgEAiAMAIYECAQCKAwAhggIBAIoDACGDAgEAigMAIYQCQACVBAAhhQJAAJUEACGGAgEAigMAIYcCAQCKAwAhAgAAAAcAIBYAAGkAIAIAAAAHACAWAABpACADAAAACQAgHQAAYgAgHgAAZwAgAQAAAAkAIAEAAAAHACAKCAAAkgQAICMAAJQEACAkAACTBAAggQIAAIIDACCCAgAAggMAIIMCAACCAwAghAIAAIIDACCFAgAAggMAIIYCAACCAwAghwIAAIIDACAQyQEAANwCADDKAQAAcAAQywEAANwCADDMAQEArQIAIc0BAQCtAgAh0QFAALACACHsAUAAsAIAIf8BAQCtAgAhgAIBAK0CACGBAgEArwIAIYICAQCvAgAhgwIBAK8CACGEAkAA3QIAIYUCQADdAgAhhgIBAK8CACGHAgEArwIAIQMAAAAHACABAABvADAiAABwACADAAAABwAgAQAACAAwAgAACQAgCckBAADaAgAwygEAAHYAEMsBAADaAgAwzAEBAAAAAdEBQADLAgAh7AFAAMsCACH8AQEA2wIAIf0BAQDbAgAh_gFAAMsCACEBAAAAcwAgAQAAAHMAIAnJAQAA2gIAMMoBAAB2ABDLAQAA2gIAMMwBAQDbAgAh0QFAAMsCACHsAUAAywIAIfwBAQDbAgAh_QEBANsCACH-AUAAywIAIQADAAAAdgAgAQAAdwAwAgAAcwAgAwAAAHYAIAEAAHcAMAIAAHMAIAMAAAB2ACABAAB3ADACAABzACAGzAEBAAAAAdEBQAAAAAHsAUAAAAAB_AEBAAAAAf0BAQAAAAH-AUAAAAABARYAAHsAIAbMAQEAAAAB0QFAAAAAAewBQAAAAAH8AQEAAAAB_QEBAAAAAf4BQAAAAAEBFgAAfQAwARYAAH0AMAbMAQEAiAMAIdEBQACLAwAh7AFAAIsDACH8AQEAiAMAIf0BAQCIAwAh_gFAAIsDACECAAAAcwAgFgAAgAEAIAbMAQEAiAMAIdEBQACLAwAh7AFAAIsDACH8AQEAiAMAIf0BAQCIAwAh_gFAAIsDACECAAAAdgAgFgAAggEAIAIAAAB2ACAWAACCAQAgAwAAAHMAIB0AAHsAIB4AAIABACABAAAAcwAgAQAAAHYAIAMIAACPBAAgIwAAkQQAICQAAJAEACAJyQEAANkCADDKAQAAiQEAEMsBAADZAgAwzAEBAK0CACHRAUAAsAIAIewBQACwAgAh_AEBAK0CACH9AQEArQIAIf4BQACwAgAhAwAAAHYAIAEAAIgBADAiAACJAQAgAwAAAHYAIAEAAHcAMAIAAHMAIAkHAADYAgAgyQEAANYCADDKAQAAEwAQywEAANYCADDMAQEAAAAB0QFAAMsCACHxAQEAAAAB8gEBAAAAAfsBAQDXAgAhAQAAAIwBACABAAAAjAEAIAIHAACOBAAg-wEAAIIDACADAAAAEwAgAQAAjwEAMAIAAIwBACADAAAAEwAgAQAAjwEAMAIAAIwBACADAAAAEwAgAQAAjwEAMAIAAIwBACAGBwAAjQQAIMwBAQAAAAHRAUAAAAAB8QEBAAAAAfIBAQAAAAH7AQEAAAABARYAAJMBACAFzAEBAAAAAdEBQAAAAAHxAQEAAAAB8gEBAAAAAfsBAQAAAAEBFgAAlQEAMAEWAACVAQAwBgcAAIAEACDMAQEAiAMAIdEBQACLAwAh8QEBAIgDACHyAQEAiAMAIfsBAQCKAwAhAgAAAIwBACAWAACYAQAgBcwBAQCIAwAh0QFAAIsDACHxAQEAiAMAIfIBAQCIAwAh-wEBAIoDACECAAAAEwAgFgAAmgEAIAIAAAATACAWAACaAQAgAwAAAIwBACAdAACTAQAgHgAAmAEAIAEAAACMAQAgAQAAABMAIAQIAAD9AwAgIwAA_wMAICQAAP4DACD7AQAAggMAIAjJAQAA1QIAMMoBAAChAQAQywEAANUCADDMAQEArQIAIdEBQACwAgAh8QEBAK0CACHyAQEArQIAIfsBAQCvAgAhAwAAABMAIAEAAKABADAiAAChAQAgAwAAABMAIAEAAI8BADACAACMAQAgAQAAABcAIAEAAAAXACADAAAAFQAgAQAAFgAwAgAAFwAgAwAAABUAIAEAABYAMAIAABcAIAMAAAAVACABAAAWADACAAAXACARCQAA-QMAIAsAAPoDACAOAAD7AwAgDwAA_AMAIMwBAQAAAAHRAUAAAAAB7AFAAAAAAfEBAQAAAAHyAQEAAAAB8wEBAAAAAfQBCAAAAAH1AQgAAAAB9gEBAAAAAfcBAQAAAAH4AQIAAAAB-QEgAAAAAfoBAQAAAAEBFgAAqQEAIA3MAQEAAAAB0QFAAAAAAewBQAAAAAHxAQEAAAAB8gEBAAAAAfMBAQAAAAH0AQgAAAAB9QEIAAAAAfYBAQAAAAH3AQEAAAAB-AECAAAAAfkBIAAAAAH6AQEAAAABARYAAKsBADABFgAAqwEAMAEAAAATACARCQAA1wMAIAsAANgDACAOAADZAwAgDwAA2gMAIMwBAQCIAwAh0QFAAIsDACHsAUAAiwMAIfEBAQCIAwAh8gEBAIgDACHzAQEAigMAIfQBCACVAwAh9QEIANUDACH2AQEAiAMAIfcBAQCKAwAh-AECAIkDACH5ASAA1gMAIfoBAQCKAwAhAgAAABcAIBYAAK8BACANzAEBAIgDACHRAUAAiwMAIewBQACLAwAh8QEBAIgDACHyAQEAiAMAIfMBAQCKAwAh9AEIAJUDACH1AQgA1QMAIfYBAQCIAwAh9wEBAIoDACH4AQIAiQMAIfkBIADWAwAh-gEBAIoDACECAAAAFQAgFgAAsQEAIAIAAAAVACAWAACxAQAgAQAAABMAIAMAAAAXACAdAACpAQAgHgAArwEAIAEAAAAXACABAAAAFQAgCQgAANADACAjAADTAwAgJAAA0gMAIHUAANEDACB2AADUAwAg8wEAAIIDACD1AQAAggMAIPcBAACCAwAg-gEAAIIDACAQyQEAAM4CADDKAQAAuQEAEMsBAADOAgAwzAEBAK0CACHRAUAAsAIAIewBQACwAgAh8QEBAK0CACHyAQEArQIAIfMBAQCvAgAh9AEIALwCACH1AQgAzwIAIfYBAQCtAgAh9wEBAK8CACH4AQIArgIAIfkBIADQAgAh-gEBAK8CACEDAAAAFQAgAQAAuAEAMCIAALkBACADAAAAFQAgAQAAFgAwAgAAFwAgCQMAAMwCACAMAADNAgAgyQEAAMoCADDKAQAAKgAQywEAAMoCADDMAQEAAAABzQEBAAAAAdEBQADLAgAh7AFAAMsCACEBAAAAvAEAIAEAAAC8AQAgAgMAAM4DACAMAADPAwAgAwAAACoAIAEAAL8BADACAAC8AQAgAwAAACoAIAEAAL8BADACAAC8AQAgAwAAACoAIAEAAL8BADACAAC8AQAgBgMAAMwDACAMAADNAwAgzAEBAAAAAc0BAQAAAAHRAUAAAAAB7AFAAAAAAQEWAADDAQAgBMwBAQAAAAHNAQEAAAAB0QFAAAAAAewBQAAAAAEBFgAAxQEAMAEWAADFAQAwBgMAAL4DACAMAAC_AwAgzAEBAIgDACHNAQEAiAMAIdEBQACLAwAh7AFAAIsDACECAAAAvAEAIBYAAMgBACAEzAEBAIgDACHNAQEAiAMAIdEBQACLAwAh7AFAAIsDACECAAAAKgAgFgAAygEAIAIAAAAqACAWAADKAQAgAwAAALwBACAdAADDAQAgHgAAyAEAIAEAAAC8AQAgAQAAACoAIAMIAAC7AwAgIwAAvQMAICQAALwDACAHyQEAAMkCADDKAQAA0QEAEMsBAADJAgAwzAEBAK0CACHNAQEArQIAIdEBQACwAgAh7AFAALACACEDAAAAKgAgAQAA0AEAMCIAANEBACADAAAAKgAgAQAAvwEAMAIAALwBACABAAAAIAAgAQAAACAAIAMAAAAeACABAAAfADACAAAgACADAAAAHgAgAQAAHwAwAgAAIAAgAwAAAB4AIAEAAB8AMAIAACAAIAYKAAC6AwAgDQAAuQMAIMwBAQAAAAHOAQEAAAAB3gECAAAAAe0BAQAAAAEBFgAA2QEAIATMAQEAAAABzgEBAAAAAd4BAgAAAAHtAQEAAAABARYAANsBADABFgAA2wEAMAYKAAC4AwAgDQAAtwMAIMwBAQCIAwAhzgEBAIgDACHeAQIAiQMAIe0BAQCIAwAhAgAAACAAIBYAAN4BACAEzAEBAIgDACHOAQEAiAMAId4BAgCJAwAh7QEBAIgDACECAAAAHgAgFgAA4AEAIAIAAAAeACAWAADgAQAgAwAAACAAIB0AANkBACAeAADeAQAgAQAAACAAIAEAAAAeACAFCAAAsgMAICMAALUDACAkAAC0AwAgdQAAswMAIHYAALYDACAHyQEAAMgCADDKAQAA5wEAEMsBAADIAgAwzAEBAK0CACHOAQEArQIAId4BAgCuAgAh7QEBAK0CACEDAAAAHgAgAQAA5gEAMCIAAOcBACADAAAAHgAgAQAAHwAwAgAAIAAgAQAAAA0AIAEAAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACAPAwAAsAMAIAwAALEDACDMAQEAAAABzQEBAAAAAdEBQAAAAAHgAQgAAAAB4gEAAADiAQLkAQAAAOQBAuYBAAAA5gEC5wEBAAAAAegBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsAUAAAAABARYAAO8BACANzAEBAAAAAc0BAQAAAAHRAUAAAAAB4AEIAAAAAeIBAAAA4gEC5AEAAADkAQLmAQAAAOYBAucBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AFAAAAAAQEWAADxAQAwARYAAPEBADAPAwAAogMAIAwAAKMDACDMAQEAiAMAIc0BAQCIAwAh0QFAAIsDACHgAQgAlQMAIeIBAACfA-IBIuQBAACgA-QBIuYBAAChA-YBIucBAQCIAwAh6AEBAIgDACHpAQEAigMAIeoBAQCIAwAh6wEBAIoDACHsAUAAiwMAIQIAAAANACAWAAD0AQAgDcwBAQCIAwAhzQEBAIgDACHRAUAAiwMAIeABCACVAwAh4gEAAJ8D4gEi5AEAAKAD5AEi5gEAAKED5gEi5wEBAIgDACHoAQEAiAMAIekBAQCKAwAh6gEBAIgDACHrAQEAigMAIewBQACLAwAhAgAAAAsAIBYAAPYBACACAAAACwAgFgAA9gEAIAMAAAANACAdAADvAQAgHgAA9AEAIAEAAAANACABAAAACwAgBwgAAJoDACAjAACdAwAgJAAAnAMAIHUAAJsDACB2AACeAwAg6QEAAIIDACDrAQAAggMAIBDJAQAAvgIAMMoBAAD9AQAQywEAAL4CADDMAQEArQIAIc0BAQCtAgAh0QFAALACACHgAQgAvAIAIeIBAAC_AuIBIuQBAADAAuQBIuYBAADBAuYBIucBAQCtAgAh6AEBAK0CACHpAQEArwIAIeoBAQCtAgAh6wEBAK8CACHsAUAAsAIAIQMAAAALACABAAD8AQAwIgAA_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_gFAALACACEJyQEAANoCADDKAQAAdgAQywEAANoCADDMAQEA2wIAIdEBQADLAgAh7AFAAMsCACH8AQEA2wIAIf0BAQDbAgAh_gFAAMsCACEL0gEBAAAAAdMBAQAAAATUAQEAAAAE1QEBAAAAAdYBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQC6AgAh2gEBAAAAAdsBAQAAAAHcAQEAAAABEMkBAADcAgAwygEAAHAAEMsBAADcAgAwzAEBAK0CACHNAQEArQIAIdEBQACwAgAh7AFAALACACH_AQEArQIAIYACAQCtAgAhgQIBAK8CACGCAgEArwIAIYMCAQCvAgAhhAJAAN0CACGFAkAA3QIAIYYCAQCvAgAhhwIBAK8CACELCAAAtQIAICMAAN8CACAkAADfAgAg0gFAAAAAAdMBQAAAAAXUAUAAAAAF1QFAAAAAAdYBQAAAAAHXAUAAAAAB2AFAAAAAAdkBQADeAgAhCwgAALUCACAjAADfAgAgJAAA3wIAINIBQAAAAAHTAUAAAAAF1AFAAAAABdUBQAAAAAHWAUAAAAAB1wFAAAAAAdgBQAAAAAHZAUAA3gIAIQjSAUAAAAAB0wFAAAAABdQBQAAAAAXVAUAAAAAB1gFAAAAAAdcBQAAAAAHYAUAAAAAB2QFAAN8CACELyQEAAOACADDKAQAAWgAQywEAAOACADDMAQEArQIAIc0BAQCtAgAh0QFAALACACHsAUAAsAIAIf4BQACwAgAhiAIBAK0CACGJAgEArwIAIYoCAQCvAgAhC8kBAADhAgAwygEAAEQAEMsBAADhAgAwzAEBAK0CACHRAUAAsAIAIewBQACwAgAh8QEBAK0CACH7AQEArwIAIYsCAQCtAgAhjAIgANACACGOAgAA4gKOAiIHCAAAsgIAICMAAOQCACAkAADkAgAg0gEAAACOAgLTAQAAAI4CCNQBAAAAjgII2QEAAOMCjgIiBwgAALICACAjAADkAgAgJAAA5AIAINIBAAAAjgIC0wEAAACOAgjUAQAAAI4CCNkBAADjAo4CIgTSAQAAAI4CAtMBAAAAjgII1AEAAACOAgjZAQAA5AKOAiIQBAAA6AIAIAUAAOkCACALAADrAgAgDQAA7AIAIBAAAOoCACDJAQAA5QIAMMoBAAAxABDLAQAA5QIAMMwBAQDbAgAh0QFAAMsCACHsAUAAywIAIfEBAQDbAgAh-wEBANcCACGLAgEA2wIAIYwCIADmAgAhjgIAAOcCjgIiAtIBIAAAAAHZASAA0gIAIQTSAQAAAI4CAtMBAAAAjgII1AEAAACOAgjZAQAA5AKOAiID7gEAAAMAIO8BAAADACDwAQAAAwAgA-4BAAAHACDvAQAABwAg8AEAAAcAIAPuAQAACwAg7wEAAAsAIPABAAALACAD7gEAABoAIO8BAAAaACDwAQAAGgAgCwMAAMwCACAMAADNAgAgyQEAAMoCADDKAQAAKgAQywEAAMoCADDMAQEA2wIAIc0BAQDbAgAh0QFAAMsCACHsAUAAywIAIZECAAAqACCSAgAAKgAgAs4BAQAAAAHtAQEAAAABCQoAAPECACANAADwAgAgyQEAAO4CADDKAQAAHgAQywEAAO4CADDMAQEA2wIAIc4BAQDbAgAh3gECAO8CACHtAQEA2wIAIQjSAQIAAAAB0wECAAAABNQBAgAAAATVAQIAAAAB1gECAAAAAdcBAgAAAAHYAQIAAAAB2QECALICACELAwAAzAIAIAwAAM0CACDJAQAAygIAMMoBAAAqABDLAQAAygIAMMwBAQDbAgAhzQEBANsCACHRAUAAywIAIewBQADLAgAhkQIAACoAIJICAAAqACAWCQAA9wIAIAsAAOsCACAOAADNAgAgDwAA-AIAIMkBAAD0AgAwygEAABUAEMsBAAD0AgAwzAEBANsCACHRAUAAywIAIewBQADLAgAh8QEBANsCACHyAQEA2wIAIfMBAQDXAgAh9AEIAPUCACH1AQgA9gIAIfYBAQDbAgAh9wEBANcCACH4AQIA7wIAIfkBIADmAgAh-gEBANcCACGRAgAAFQAgkgIAABUAIALNAQEAAAABzgEBAAAAAQsDAADMAgAgCgAA8QIAIMkBAADzAgAwygEAABoAEMsBAADzAgAwzAEBANsCACHNAQEA2wIAIc4BAQDbAgAhzwECAO8CACHQAQEA1wIAIdEBQADLAgAhFAkAAPcCACALAADrAgAgDgAAzQIAIA8AAPgCACDJAQAA9AIAMMoBAAAVABDLAQAA9AIAMMwBAQDbAgAh0QFAAMsCACHsAUAAywIAIfEBAQDbAgAh8gEBANsCACHzAQEA1wIAIfQBCAD1AgAh9QEIAPYCACH2AQEA2wIAIfcBAQDXAgAh-AECAO8CACH5ASAA5gIAIfoBAQDXAgAhCNIBCAAAAAHTAQgAAAAE1AEIAAAABNUBCAAAAAHWAQgAAAAB1wEIAAAAAdgBCAAAAAHZAQgAuAIAIQjSAQgAAAAB0wEIAAAABdQBCAAAAAXVAQgAAAAB1gEIAAAAAdcBCAAAAAHYAQgAAAAB2QEIANQCACELBwAA2AIAIMkBAADWAgAwygEAABMAEMsBAADWAgAwzAEBANsCACHRAUAAywIAIfEBAQDbAgAh8gEBANsCACH7AQEA1wIAIZECAAATACCSAgAAEwAgA-4BAAAPACDvAQAADwAg8AEAAA8AIAoGAAD6AgAgCgAA8QIAIMkBAAD5AgAwygEAAA8AEMsBAAD5AgAwzAEBANsCACHOAQEA2wIAId0BAQDbAgAh3gECAO8CACHfAQgA9QIAIRQDAADMAgAgDAAA-AIAIMkBAAD7AgAwygEAAAsAEMsBAAD7AgAwzAEBANsCACHNAQEA2wIAIdEBQADLAgAh4AEIAPUCACHiAQAA_ALiASLkAQAA_QLkASLmAQAA_gLmASLnAQEA2wIAIegBAQDbAgAh6QEBANcCACHqAQEA2wIAIesBAQDXAgAh7AFAAMsCACGRAgAACwAgkgIAAAsAIBIDAADMAgAgDAAA-AIAIMkBAAD7AgAwygEAAAsAEMsBAAD7AgAwzAEBANsCACHNAQEA2wIAIdEBQADLAgAh4AEIAPUCACHiAQAA_ALiASLkAQAA_QLkASLmAQAA_gLmASLnAQEA2wIAIegBAQDbAgAh6QEBANcCACHqAQEA2wIAIesBAQDXAgAh7AFAAMsCACEE0gEAAADiAQLTAQAAAOIBCNQBAAAA4gEI2QEAAMcC4gEiBNIBAAAA5AEC0wEAAADkAQjUAQAAAOQBCNkBAADFAuQBIgTSAQAAAOYBAtMBAAAA5gEI1AEAAADmAQjZAQAAwwLmASIRAwAAzAIAIMkBAAD_AgAwygEAAAcAEMsBAAD_AgAwzAEBANsCACHNAQEA2wIAIdEBQADLAgAh7AFAAMsCACH_AQEA2wIAIYACAQDbAgAhgQIBANcCACGCAgEA1wIAIYMCAQDXAgAhhAJAAIADACGFAkAAgAMAIYYCAQDXAgAhhwIBANcCACEI0gFAAAAAAdMBQAAAAAXUAUAAAAAF1QFAAAAAAdYBQAAAAAHXAUAAAAAB2AFAAAAAAdkBQADfAgAhDAMAAMwCACDJAQAAgQMAMMoBAAADABDLAQAAgQMAMMwBAQDbAgAhzQEBANsCACHRAUAAywIAIewBQADLAgAh_gFAAMsCACGIAgEA2wIAIYkCAQDXAgAhigIBANcCACEAAAAAAAABlgIBAAAAAQWWAgIAAAABnAICAAAAAZ0CAgAAAAGeAgIAAAABnwICAAAAAQGWAgEAAAABAZYCQAAAAAEFHQAAnwUAIB4AAKUFACCTAgAAoAUAIJQCAACkBQAgmQIAAAEAIAUdAACdBQAgHgAAogUAIJMCAACeBQAglAIAAKEFACCZAgAAFwAgAx0AAJ8FACCTAgAAoAUAIJkCAAABACADHQAAnQUAIJMCAACeBQAgmQIAABcAIAAAAAAABZYCCAAAAAGcAggAAAABnQIIAAAAAZ4CCAAAAAGfAggAAAABBR0AAJUFACAeAACbBQAgkwIAAJYFACCUAgAAmgUAIJkCAAANACAFHQAAkwUAIB4AAJgFACCTAgAAlAUAIJQCAACXBQAgmQIAABcAIAMdAACVBQAgkwIAAJYFACCZAgAADQAgAx0AAJMFACCTAgAAlAUAIJkCAAAXACAAAAAAAAGWAgAAAOIBAgGWAgAAAOQBAgGWAgAAAOYBAgUdAACNBQAgHgAAkQUAIJMCAACOBQAglAIAAJAFACCZAgAAAQAgCx0AAKQDADAeAACpAwAwkwIAAKUDADCUAgAApgMAMJUCAACnAwAglgIAAKgDADCXAgAAqAMAMJgCAACoAwAwmQIAAKgDADCaAgAAqgMAMJsCAACrAwAwBQoAAJkDACDMAQEAAAABzgEBAAAAAd4BAgAAAAHfAQgAAAABAgAAABEAIB0AAK8DACADAAAAEQAgHQAArwMAIB4AAK4DACABFgAAjwUAMAoGAAD6AgAgCgAA8QIAIMkBAAD5AgAwygEAAA8AEMsBAAD5AgAwzAEBAAAAAc4BAQDbAgAh3QEBANsCACHeAQIA7wIAId8BCAD1AgAhAgAAABEAIBYAAK4DACACAAAArAMAIBYAAK0DACAIyQEAAKsDADDKAQAArAMAEMsBAACrAwAwzAEBANsCACHOAQEA2wIAId0BAQDbAgAh3gECAO8CACHfAQgA9QIAIQjJAQAAqwMAMMoBAACsAwAQywEAAKsDADDMAQEA2wIAIc4BAQDbAgAh3QEBANsCACHeAQIA7wIAId8BCAD1AgAhBMwBAQCIAwAhzgEBAIgDACHeAQIAiQMAId8BCACVAwAhBQoAAJcDACDMAQEAiAMAIc4BAQCIAwAh3gECAIkDACHfAQgAlQMAIQUKAACZAwAgzAEBAAAAAc4BAQAAAAHeAQIAAAAB3wEIAAAAAQMdAACNBQAgkwIAAI4FACCZAgAAAQAgBB0AAKQDADCTAgAApQMAMJUCAACnAwAgmQIAAKgDADAAAAAAAAUdAACFBQAgHgAAiwUAIJMCAACGBQAglAIAAIoFACCZAgAAvAEAIAUdAACDBQAgHgAAiAUAIJMCAACEBQAglAIAAIcFACCZAgAAFwAgAx0AAIUFACCTAgAAhgUAIJkCAAC8AQAgAx0AAIMFACCTAgAAhAUAIJkCAAAXACAAAAAFHQAA_QQAIB4AAIEFACCTAgAA_gQAIJQCAACABQAgmQIAAAEAIAsdAADAAwAwHgAAxQMAMJMCAADBAwAwlAIAAMIDADCVAgAAwwMAIJYCAADEAwAwlwIAAMQDADCYAgAAxAMAMJkCAADEAwAwmgIAAMYDADCbAgAAxwMAMAQKAAC6AwAgzAEBAAAAAc4BAQAAAAHeAQIAAAABAgAAACAAIB0AAMsDACADAAAAIAAgHQAAywMAIB4AAMoDACABFgAA_wQAMAoKAADxAgAgDQAA8AIAIMkBAADuAgAwygEAAB4AEMsBAADuAgAwzAEBAAAAAc4BAQDbAgAh3gECAO8CACHtAQEA2wIAIY8CAADtAgAgAgAAACAAIBYAAMoDACACAAAAyAMAIBYAAMkDACAHyQEAAMcDADDKAQAAyAMAEMsBAADHAwAwzAEBANsCACHOAQEA2wIAId4BAgDvAgAh7QEBANsCACEHyQEAAMcDADDKAQAAyAMAEMsBAADHAwAwzAEBANsCACHOAQEA2wIAId4BAgDvAgAh7QEBANsCACEDzAEBAIgDACHOAQEAiAMAId4BAgCJAwAhBAoAALgDACDMAQEAiAMAIc4BAQCIAwAh3gECAIkDACEECgAAugMAIMwBAQAAAAHOAQEAAAAB3gECAAAAAQMdAAD9BAAgkwIAAP4EACCZAgAAAQAgBB0AAMADADCTAgAAwQMAMJUCAADDAwAgmQIAAMQDADAGBAAA3QQAIAUAAN4EACALAADgBAAgDQAA4QQAIBAAAN8EACD7AQAAggMAIAAAAAAAAAWWAggAAAABnAIIAAAAAZ0CCAAAAAGeAggAAAABnwIIAAAAAQGWAiAAAAABBx0AAPUEACAeAAD7BAAgkwIAAPYEACCUAgAA-gQAIJcCAAATACCYAgAAEwAgmQIAAIwBACALHQAA7QMAMB4AAPIDADCTAgAA7gMAMJQCAADvAwAwlQIAAPADACCWAgAA8QMAMJcCAADxAwAwmAIAAPEDADCZAgAA8QMAMJoCAADzAwAwmwIAAPQDADALHQAA5AMAMB4AAOgDADCTAgAA5QMAMJQCAADmAwAwlQIAAOcDACCWAgAAxAMAMJcCAADEAwAwmAIAAMQDADCZAgAAxAMAMJoCAADpAwAwmwIAAMcDADALHQAA2wMAMB4AAN8DADCTAgAA3AMAMJQCAADdAwAwlQIAAN4DACCWAgAAqAMAMJcCAACoAwAwmAIAAKgDADCZAgAAqAMAMJoCAADgAwAwmwIAAKsDADAFBgAAmAMAIMwBAQAAAAHdAQEAAAAB3gECAAAAAd8BCAAAAAECAAAAEQAgHQAA4wMAIAMAAAARACAdAADjAwAgHgAA4gMAIAEWAAD5BAAwAgAAABEAIBYAAOIDACACAAAArAMAIBYAAOEDACAEzAEBAIgDACHdAQEAiAMAId4BAgCJAwAh3wEIAJUDACEFBgAAlgMAIMwBAQCIAwAh3QEBAIgDACHeAQIAiQMAId8BCACVAwAhBQYAAJgDACDMAQEAAAAB3QEBAAAAAd4BAgAAAAHfAQgAAAABBA0AALkDACDMAQEAAAAB3gECAAAAAe0BAQAAAAECAAAAIAAgHQAA7AMAIAMAAAAgACAdAADsAwAgHgAA6wMAIAEWAAD4BAAwAgAAACAAIBYAAOsDACACAAAAyAMAIBYAAOoDACADzAEBAIgDACHeAQIAiQMAIe0BAQCIAwAhBA0AALcDACDMAQEAiAMAId4BAgCJAwAh7QEBAIgDACEEDQAAuQMAIMwBAQAAAAHeAQIAAAAB7QEBAAAAAQYDAACOAwAgzAEBAAAAAc0BAQAAAAHPAQIAAAAB0AEBAAAAAdEBQAAAAAECAAAAHAAgHQAA-AMAIAMAAAAcACAdAAD4AwAgHgAA9wMAIAEWAAD3BAAwDAMAAMwCACAKAADxAgAgyQEAAPMCADDKAQAAGgAQywEAAPMCADDMAQEAAAABzQEBANsCACHOAQEA2wIAIc8BAgDvAgAh0AEBANcCACHRAUAAywIAIZACAADyAgAgAgAAABwAIBYAAPcDACACAAAA9QMAIBYAAPYDACAJyQEAAPQDADDKAQAA9QMAEMsBAAD0AwAwzAEBANsCACHNAQEA2wIAIc4BAQDbAgAhzwECAO8CACHQAQEA1wIAIdEBQADLAgAhCckBAAD0AwAwygEAAPUDABDLAQAA9AMAMMwBAQDbAgAhzQEBANsCACHOAQEA2wIAIc8BAgDvAgAh0AEBANcCACHRAUAAywIAIQXMAQEAiAMAIc0BAQCIAwAhzwECAIkDACHQAQEAigMAIdEBQACLAwAhBgMAAIwDACDMAQEAiAMAIc0BAQCIAwAhzwECAIkDACHQAQEAigMAIdEBQACLAwAhBgMAAI4DACDMAQEAAAABzQEBAAAAAc8BAgAAAAHQAQEAAAAB0QFAAAAAAQMdAAD1BAAgkwIAAPYEACCZAgAAjAEAIAQdAADtAwAwkwIAAO4DADCVAgAA8AMAIJkCAADxAwAwBB0AAOQDADCTAgAA5QMAMJUCAADnAwAgmQIAAMQDADAEHQAA2wMAMJMCAADcAwAwlQIAAN4DACCZAgAAqAMAMAAAAAsdAACBBAAwHgAAhgQAMJMCAACCBAAwlAIAAIMEADCVAgAAhAQAIJYCAACFBAAwlwIAAIUEADCYAgAAhQQAMJkCAACFBAAwmgIAAIcEADCbAgAAiAQAMA8LAAD6AwAgDgAA-wMAIA8AAPwDACDMAQEAAAAB0QFAAAAAAewBQAAAAAHxAQEAAAAB8gEBAAAAAfMBAQAAAAH0AQgAAAAB9QEIAAAAAfYBAQAAAAH3AQEAAAAB-AECAAAAAfkBIAAAAAECAAAAFwAgHQAAjAQAIAMAAAAXACAdAACMBAAgHgAAiwQAIAEWAAD0BAAwFAkAAPcCACALAADrAgAgDgAAzQIAIA8AAPgCACDJAQAA9AIAMMoBAAAVABDLAQAA9AIAMMwBAQAAAAHRAUAAywIAIewBQADLAgAh8QEBANsCACHyAQEAAAAB8wEBANcCACH0AQgA9QIAIfUBCAD2AgAh9gEBANsCACH3AQEA1wIAIfgBAgDvAgAh-QEgAOYCACH6AQEA1wIAIQIAAAAXACAWAACLBAAgAgAAAIkEACAWAACKBAAgEMkBAACIBAAwygEAAIkEABDLAQAAiAQAMMwBAQDbAgAh0QFAAMsCACHsAUAAywIAIfEBAQDbAgAh8gEBANsCACHzAQEA1wIAIfQBCAD1AgAh9QEIAPYCACH2AQEA2wIAIfcBAQDXAgAh-AECAO8CACH5ASAA5gIAIfoBAQDXAgAhEMkBAACIBAAwygEAAIkEABDLAQAAiAQAMMwBAQDbAgAh0QFAAMsCACHsAUAAywIAIfEBAQDbAgAh8gEBANsCACHzAQEA1wIAIfQBCAD1AgAh9QEIAPYCACH2AQEA2wIAIfcBAQDXAgAh-AECAO8CACH5ASAA5gIAIfoBAQDXAgAhDMwBAQCIAwAh0QFAAIsDACHsAUAAiwMAIfEBAQCIAwAh8gEBAIgDACHzAQEAigMAIfQBCACVAwAh9QEIANUDACH2AQEAiAMAIfcBAQCKAwAh-AECAIkDACH5ASAA1gMAIQ8LAADYAwAgDgAA2QMAIA8AANoDACDMAQEAiAMAIdEBQACLAwAh7AFAAIsDACHxAQEAiAMAIfIBAQCIAwAh8wEBAIoDACH0AQgAlQMAIfUBCADVAwAh9gEBAIgDACH3AQEAigMAIfgBAgCJAwAh-QEgANYDACEPCwAA-gMAIA4AAPsDACAPAAD8AwAgzAEBAAAAAdEBQAAAAAHsAUAAAAAB8QEBAAAAAfIBAQAAAAHzAQEAAAAB9AEIAAAAAfUBCAAAAAH2AQEAAAAB9wEBAAAAAfgBAgAAAAH5ASAAAAABBB0AAIEEADCTAgAAggQAMJUCAACEBAAgmQIAAIUEADAAAAAAAAAAAZYCQAAAAAEFHQAA7wQAIB4AAPIEACCTAgAA8AQAIJQCAADxBAAgmQIAAAEAIAMdAADvBAAgkwIAAPAEACCZAgAAAQAgAAAABR0AAOoEACAeAADtBAAgkwIAAOsEACCUAgAA7AQAIJkCAAABACADHQAA6gQAIJMCAADrBAAgmQIAAAEAIAAAAAGWAgAAAI4CAgsdAADMBAAwHgAA0QQAMJMCAADNBAAwlAIAAM4EADCVAgAAzwQAIJYCAADQBAAwlwIAANAEADCYAgAA0AQAMJkCAADQBAAwmgIAANIEADCbAgAA0wQAMAsdAADABAAwHgAAxQQAMJMCAADBBAAwlAIAAMIEADCVAgAAwwQAIJYCAADEBAAwlwIAAMQEADCYAgAAxAQAMJkCAADEBAAwmgIAAMYEADCbAgAAxwQAMAsdAAC0BAAwHgAAuQQAMJMCAAC1BAAwlAIAALYEADCVAgAAtwQAIJYCAAC4BAAwlwIAALgEADCYAgAAuAQAMJkCAAC4BAAwmgIAALoEADCbAgAAuwQAMAsdAACrBAAwHgAArwQAMJMCAACsBAAwlAIAAK0EADCVAgAArgQAIJYCAADxAwAwlwIAAPEDADCYAgAA8QMAMJkCAADxAwAwmgIAALAEADCbAgAA9AMAMAcdAACmBAAgHgAAqQQAIJMCAACnBAAglAIAAKgEACCXAgAAKgAgmAIAACoAIJkCAAC8AQAgBAwAAM0DACDMAQEAAAAB0QFAAAAAAewBQAAAAAECAAAAvAEAIB0AAKYEACADAAAAKgAgHQAApgQAIB4AAKoEACAGAAAAKgAgDAAAvwMAIBYAAKoEACDMAQEAiAMAIdEBQACLAwAh7AFAAIsDACEEDAAAvwMAIMwBAQCIAwAh0QFAAIsDACHsAUAAiwMAIQYKAACPAwAgzAEBAAAAAc4BAQAAAAHPAQIAAAAB0AEBAAAAAdEBQAAAAAECAAAAHAAgHQAAswQAIAMAAAAcACAdAACzBAAgHgAAsgQAIAEWAADpBAAwAgAAABwAIBYAALIEACACAAAA9QMAIBYAALEEACAFzAEBAIgDACHOAQEAiAMAIc8BAgCJAwAh0AEBAIoDACHRAUAAiwMAIQYKAACNAwAgzAEBAIgDACHOAQEAiAMAIc8BAgCJAwAh0AEBAIoDACHRAUAAiwMAIQYKAACPAwAgzAEBAAAAAc4BAQAAAAHPAQIAAAAB0AEBAAAAAdEBQAAAAAENDAAAsQMAIMwBAQAAAAHRAUAAAAAB4AEIAAAAAeIBAAAA4gEC5AEAAADkAQLmAQAAAOYBAucBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AFAAAAAAQIAAAANACAdAAC_BAAgAwAAAA0AIB0AAL8EACAeAAC-BAAgARYAAOgEADASAwAAzAIAIAwAAPgCACDJAQAA-wIAMMoBAAALABDLAQAA-wIAMMwBAQAAAAHNAQEA2wIAIdEBQADLAgAh4AEIAPUCACHiAQAA_ALiASLkAQAA_QLkASLmAQAA_gLmASLnAQEA2wIAIegBAQDbAgAh6QEBANcCACHqAQEA2wIAIesBAQDXAgAh7AFAAMsCACECAAAADQAgFgAAvgQAIAIAAAC8BAAgFgAAvQQAIBDJAQAAuwQAMMoBAAC8BAAQywEAALsEADDMAQEA2wIAIc0BAQDbAgAh0QFAAMsCACHgAQgA9QIAIeIBAAD8AuIBIuQBAAD9AuQBIuYBAAD-AuYBIucBAQDbAgAh6AEBANsCACHpAQEA1wIAIeoBAQDbAgAh6wEBANcCACHsAUAAywIAIRDJAQAAuwQAMMoBAAC8BAAQywEAALsEADDMAQEA2wIAIc0BAQDbAgAh0QFAAMsCACHgAQgA9QIAIeIBAAD8AuIBIuQBAAD9AuQBIuYBAAD-AuYBIucBAQDbAgAh6AEBANsCACHpAQEA1wIAIeoBAQDbAgAh6wEBANcCACHsAUAAywIAIQzMAQEAiAMAIdEBQACLAwAh4AEIAJUDACHiAQAAnwPiASLkAQAAoAPkASLmAQAAoQPmASLnAQEAiAMAIegBAQCIAwAh6QEBAIoDACHqAQEAiAMAIesBAQCKAwAh7AFAAIsDACENDAAAowMAIMwBAQCIAwAh0QFAAIsDACHgAQgAlQMAIeIBAACfA-IBIuQBAACgA-QBIuYBAAChA-YBIucBAQCIAwAh6AEBAIgDACHpAQEAigMAIeoBAQCIAwAh6wEBAIoDACHsAUAAiwMAIQ0MAACxAwAgzAEBAAAAAdEBQAAAAAHgAQgAAAAB4gEAAADiAQLkAQAAAOQBAuYBAAAA5gEC5wEBAAAAAegBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsAUAAAAABDMwBAQAAAAHRAUAAAAAB7AFAAAAAAf8BAQAAAAGAAgEAAAABgQIBAAAAAYICAQAAAAGDAgEAAAABhAJAAAAAAYUCQAAAAAGGAgEAAAABhwIBAAAAAQIAAAAJACAdAADLBAAgAwAAAAkAIB0AAMsEACAeAADKBAAgARYAAOcEADARAwAAzAIAIMkBAAD_AgAwygEAAAcAEMsBAAD_AgAwzAEBAAAAAc0BAQDbAgAh0QFAAMsCACHsAUAAywIAIf8BAQDbAgAhgAIBANsCACGBAgEA1wIAIYICAQDXAgAhgwIBANcCACGEAkAAgAMAIYUCQACAAwAhhgIBANcCACGHAgEA1wIAIQIAAAAJACAWAADKBAAgAgAAAMgEACAWAADJBAAgEMkBAADHBAAwygEAAMgEABDLAQAAxwQAMMwBAQDbAgAhzQEBANsCACHRAUAAywIAIewBQADLAgAh_wEBANsCACGAAgEA2wIAIYECAQDXAgAhggIBANcCACGDAgEA1wIAIYQCQACAAwAhhQJAAIADACGGAgEA1wIAIYcCAQDXAgAhEMkBAADHBAAwygEAAMgEABDLAQAAxwQAMMwBAQDbAgAhzQEBANsCACHRAUAAywIAIewBQADLAgAh_wEBANsCACGAAgEA2wIAIYECAQDXAgAhggIBANcCACGDAgEA1wIAIYQCQACAAwAhhQJAAIADACGGAgEA1wIAIYcCAQDXAgAhDMwBAQCIAwAh0QFAAIsDACHsAUAAiwMAIf8BAQCIAwAhgAIBAIgDACGBAgEAigMAIYICAQCKAwAhgwIBAIoDACGEAkAAlQQAIYUCQACVBAAhhgIBAIoDACGHAgEAigMAIQzMAQEAiAMAIdEBQACLAwAh7AFAAIsDACH_AQEAiAMAIYACAQCIAwAhgQIBAIoDACGCAgEAigMAIYMCAQCKAwAhhAJAAJUEACGFAkAAlQQAIYYCAQCKAwAhhwIBAIoDACEMzAEBAAAAAdEBQAAAAAHsAUAAAAAB_wEBAAAAAYACAQAAAAGBAgEAAAABggIBAAAAAYMCAQAAAAGEAkAAAAABhQJAAAAAAYYCAQAAAAGHAgEAAAABB8wBAQAAAAHRAUAAAAAB7AFAAAAAAf4BQAAAAAGIAgEAAAABiQIBAAAAAYoCAQAAAAECAAAABQAgHQAA1wQAIAMAAAAFACAdAADXBAAgHgAA1gQAIAEWAADmBAAwDAMAAMwCACDJAQAAgQMAMMoBAAADABDLAQAAgQMAMMwBAQAAAAHNAQEA2wIAIdEBQADLAgAh7AFAAMsCACH-AUAAywIAIYgCAQAAAAGJAgEA1wIAIYoCAQDXAgAhAgAAAAUAIBYAANYEACACAAAA1AQAIBYAANUEACALyQEAANMEADDKAQAA1AQAEMsBAADTBAAwzAEBANsCACHNAQEA2wIAIdEBQADLAgAh7AFAAMsCACH-AUAAywIAIYgCAQDbAgAhiQIBANcCACGKAgEA1wIAIQvJAQAA0wQAMMoBAADUBAAQywEAANMEADDMAQEA2wIAIc0BAQDbAgAh0QFAAMsCACHsAUAAywIAIf4BQADLAgAhiAIBANsCACGJAgEA1wIAIYoCAQDXAgAhB8wBAQCIAwAh0QFAAIsDACHsAUAAiwMAIf4BQACLAwAhiAIBAIgDACGJAgEAigMAIYoCAQCKAwAhB8wBAQCIAwAh0QFAAIsDACHsAUAAiwMAIf4BQACLAwAhiAIBAIgDACGJAgEAigMAIYoCAQCKAwAhB8wBAQAAAAHRAUAAAAAB7AFAAAAAAf4BQAAAAAGIAgEAAAABiQIBAAAAAYoCAQAAAAEEHQAAzAQAMJMCAADNBAAwlQIAAM8EACCZAgAA0AQAMAQdAADABAAwkwIAAMEEADCVAgAAwwQAIJkCAADEBAAwBB0AALQEADCTAgAAtQQAMJUCAAC3BAAgmQIAALgEADAEHQAAqwQAMJMCAACsBAAwlQIAAK4EACCZAgAA8QMAMAMdAACmBAAgkwIAAKcEACCZAgAAvAEAIAAAAAACAwAAzgMAIAwAAM8DACAICQAA4wQAIAsAAOAEACAOAADPAwAgDwAA5AQAIPMBAACCAwAg9QEAAIIDACD3AQAAggMAIPoBAACCAwAgAgcAAI4EACD7AQAAggMAIAAEAwAAzgMAIAwAAOQEACDpAQAAggMAIOsBAACCAwAgB8wBAQAAAAHRAUAAAAAB7AFAAAAAAf4BQAAAAAGIAgEAAAABiQIBAAAAAYoCAQAAAAEMzAEBAAAAAdEBQAAAAAHsAUAAAAAB_wEBAAAAAYACAQAAAAGBAgEAAAABggIBAAAAAYMCAQAAAAGEAkAAAAABhQJAAAAAAYYCAQAAAAGHAgEAAAABDMwBAQAAAAHRAUAAAAAB4AEIAAAAAeIBAAAA4gEC5AEAAADkAQLmAQAAAOYBAucBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AFAAAAAAQXMAQEAAAABzgEBAAAAAc8BAgAAAAHQAQEAAAAB0QFAAAAAAQwFAADZBAAgCwAA2wQAIA0AANwEACAQAADaBAAgzAEBAAAAAdEBQAAAAAHsAUAAAAAB8QEBAAAAAfsBAQAAAAGLAgEAAAABjAIgAAAAAY4CAAAAjgICAgAAAAEAIB0AAOoEACADAAAAMQAgHQAA6gQAIB4AAO4EACAOAAAAMQAgBQAAogQAIAsAAKQEACANAAClBAAgEAAAowQAIBYAAO4EACDMAQEAiAMAIdEBQACLAwAh7AFAAIsDACHxAQEAiAMAIfsBAQCKAwAhiwIBAIgDACGMAiAA1gMAIY4CAACgBI4CIgwFAACiBAAgCwAApAQAIA0AAKUEACAQAACjBAAgzAEBAIgDACHRAUAAiwMAIewBQACLAwAh8QEBAIgDACH7AQEAigMAIYsCAQCIAwAhjAIgANYDACGOAgAAoASOAiIMBAAA2AQAIAsAANsEACANAADcBAAgEAAA2gQAIMwBAQAAAAHRAUAAAAAB7AFAAAAAAfEBAQAAAAH7AQEAAAABiwIBAAAAAYwCIAAAAAGOAgAAAI4CAgIAAAABACAdAADvBAAgAwAAADEAIB0AAO8EACAeAADzBAAgDgAAADEAIAQAAKEEACALAACkBAAgDQAApQQAIBAAAKMEACAWAADzBAAgzAEBAIgDACHRAUAAiwMAIewBQACLAwAh8QEBAIgDACH7AQEAigMAIYsCAQCIAwAhjAIgANYDACGOAgAAoASOAiIMBAAAoQQAIAsAAKQEACANAAClBAAgEAAAowQAIMwBAQCIAwAh0QFAAIsDACHsAUAAiwMAIfEBAQCIAwAh-wEBAIoDACGLAgEAiAMAIYwCIADWAwAhjgIAAKAEjgIiDMwBAQAAAAHRAUAAAAAB7AFAAAAAAfEBAQAAAAHyAQEAAAAB8wEBAAAAAfQBCAAAAAH1AQgAAAAB9gEBAAAAAfcBAQAAAAH4AQIAAAAB-QEgAAAAAQXMAQEAAAAB0QFAAAAAAfEBAQAAAAHyAQEAAAAB-wEBAAAAAQIAAACMAQAgHQAA9QQAIAXMAQEAAAABzQEBAAAAAc8BAgAAAAHQAQEAAAAB0QFAAAAAAQPMAQEAAAAB3gECAAAAAe0BAQAAAAEEzAEBAAAAAd0BAQAAAAHeAQIAAAAB3wEIAAAAAQMAAAATACAdAAD1BAAgHgAA_AQAIAcAAAATACAWAAD8BAAgzAEBAIgDACHRAUAAiwMAIfEBAQCIAwAh8gEBAIgDACH7AQEAigMAIQXMAQEAiAMAIdEBQACLAwAh8QEBAIgDACHyAQEAiAMAIfsBAQCKAwAhDAQAANgEACAFAADZBAAgCwAA2wQAIBAAANoEACDMAQEAAAAB0QFAAAAAAewBQAAAAAHxAQEAAAAB-wEBAAAAAYsCAQAAAAGMAiAAAAABjgIAAACOAgICAAAAAQAgHQAA_QQAIAPMAQEAAAABzgEBAAAAAd4BAgAAAAEDAAAAMQAgHQAA_QQAIB4AAIIFACAOAAAAMQAgBAAAoQQAIAUAAKIEACALAACkBAAgEAAAowQAIBYAAIIFACDMAQEAiAMAIdEBQACLAwAh7AFAAIsDACHxAQEAiAMAIfsBAQCKAwAhiwIBAIgDACGMAiAA1gMAIY4CAACgBI4CIgwEAAChBAAgBQAAogQAIAsAAKQEACAQAACjBAAgzAEBAIgDACHRAUAAiwMAIewBQACLAwAh8QEBAIgDACH7AQEAigMAIYsCAQCIAwAhjAIgANYDACGOAgAAoASOAiIQCQAA-QMAIAsAAPoDACAPAAD8AwAgzAEBAAAAAdEBQAAAAAHsAUAAAAAB8QEBAAAAAfIBAQAAAAHzAQEAAAAB9AEIAAAAAfUBCAAAAAH2AQEAAAAB9wEBAAAAAfgBAgAAAAH5ASAAAAAB-gEBAAAAAQIAAAAXACAdAACDBQAgBQMAAMwDACDMAQEAAAABzQEBAAAAAdEBQAAAAAHsAUAAAAABAgAAALwBACAdAACFBQAgAwAAABUAIB0AAIMFACAeAACJBQAgEgAAABUAIAkAANcDACALAADYAwAgDwAA2gMAIBYAAIkFACDMAQEAiAMAIdEBQACLAwAh7AFAAIsDACHxAQEAiAMAIfIBAQCIAwAh8wEBAIoDACH0AQgAlQMAIfUBCADVAwAh9gEBAIgDACH3AQEAigMAIfgBAgCJAwAh-QEgANYDACH6AQEAigMAIRAJAADXAwAgCwAA2AMAIA8AANoDACDMAQEAiAMAIdEBQACLAwAh7AFAAIsDACHxAQEAiAMAIfIBAQCIAwAh8wEBAIoDACH0AQgAlQMAIfUBCADVAwAh9gEBAIgDACH3AQEAigMAIfgBAgCJAwAh-QEgANYDACH6AQEAigMAIQMAAAAqACAdAACFBQAgHgAAjAUAIAcAAAAqACADAAC-AwAgFgAAjAUAIMwBAQCIAwAhzQEBAIgDACHRAUAAiwMAIewBQACLAwAhBQMAAL4DACDMAQEAiAMAIc0BAQCIAwAh0QFAAIsDACHsAUAAiwMAIQwEAADYBAAgBQAA2QQAIAsAANsEACANAADcBAAgzAEBAAAAAdEBQAAAAAHsAUAAAAAB8QEBAAAAAfsBAQAAAAGLAgEAAAABjAIgAAAAAY4CAAAAjgICAgAAAAEAIB0AAI0FACAEzAEBAAAAAc4BAQAAAAHeAQIAAAAB3wEIAAAAAQMAAAAxACAdAACNBQAgHgAAkgUAIA4AAAAxACAEAAChBAAgBQAAogQAIAsAAKQEACANAAClBAAgFgAAkgUAIMwBAQCIAwAh0QFAAIsDACHsAUAAiwMAIfEBAQCIAwAh-wEBAIoDACGLAgEAiAMAIYwCIADWAwAhjgIAAKAEjgIiDAQAAKEEACAFAACiBAAgCwAApAQAIA0AAKUEACDMAQEAiAMAIdEBQACLAwAh7AFAAIsDACHxAQEAiAMAIfsBAQCKAwAhiwIBAIgDACGMAiAA1gMAIY4CAACgBI4CIhAJAAD5AwAgCwAA-gMAIA4AAPsDACDMAQEAAAAB0QFAAAAAAewBQAAAAAHxAQEAAAAB8gEBAAAAAfMBAQAAAAH0AQgAAAAB9QEIAAAAAfYBAQAAAAH3AQEAAAAB-AECAAAAAfkBIAAAAAH6AQEAAAABAgAAABcAIB0AAJMFACAOAwAAsAMAIMwBAQAAAAHNAQEAAAAB0QFAAAAAAeABCAAAAAHiAQAAAOIBAuQBAAAA5AEC5gEAAADmAQLnAQEAAAAB6AEBAAAAAekBAQAAAAHqAQEAAAAB6wEBAAAAAewBQAAAAAECAAAADQAgHQAAlQUAIAMAAAAVACAdAACTBQAgHgAAmQUAIBIAAAAVACAJAADXAwAgCwAA2AMAIA4AANkDACAWAACZBQAgzAEBAIgDACHRAUAAiwMAIewBQACLAwAh8QEBAIgDACHyAQEAiAMAIfMBAQCKAwAh9AEIAJUDACH1AQgA1QMAIfYBAQCIAwAh9wEBAIoDACH4AQIAiQMAIfkBIADWAwAh-gEBAIoDACEQCQAA1wMAIAsAANgDACAOAADZAwAgzAEBAIgDACHRAUAAiwMAIewBQACLAwAh8QEBAIgDACHyAQEAiAMAIfMBAQCKAwAh9AEIAJUDACH1AQgA1QMAIfYBAQCIAwAh9wEBAIoDACH4AQIAiQMAIfkBIADWAwAh-gEBAIoDACEDAAAACwAgHQAAlQUAIB4AAJwFACAQAAAACwAgAwAAogMAIBYAAJwFACDMAQEAiAMAIc0BAQCIAwAh0QFAAIsDACHgAQgAlQMAIeIBAACfA-IBIuQBAACgA-QBIuYBAAChA-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_GARCAAccBPoEByQELggHLARCDAcwBP4QBzQELhQHOAQuGAc8BEIcB0gFAiAHTAUSJAdQBCooB1QEKiwHWAQqMAdcBCo0B2AEKjgHaAQqPAdwBEJAB3QFFkQHfAQqSAeEBEJMB4gFGlAHjAQqVAeQBCpYB5QEQlwHoAUeYAekBTZkB6gEEmgHrAQSbAewBBJwB7QEEnQHuAQSeAfABBJ8B8gEQoAHzAU6hAfUBBKIB9wEQowH4AU-kAfkBBKUB-gEEpgH7ARCnAf4BUKgB_wFWqQGAAgWqAYECBasBggIFrAGDAgWtAYQCBa4BhgIFrwGIAhCwAYkCV7EBiwIFsgGNAhCzAY4CWLQBjwIFtQGQAgW2AZECELcBlAJZuAGVAl-5AZYCCboBlwIJuwGYAgm8AZkCCb0BmgIJvgGcAgm_AZ4CEMABnwJgwQGhAgnCAaMCEMMBpAJhxAGlAgnFAaYCCcYBpwIQxwGqAmLIAasCaA"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.js
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.js
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/email.js
import nodemailer from "nodemailer";
var transporter = null;
var getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};
var sendEmail = async ({ to, subject, html }) => {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.EMAIL_FROM ?? "Red Rose Shop <noreply@redrose.com>",
    to,
    subject,
    html
  });
};
var sendVerificationEmail = async (email, name, verificationUrl) => {
  await sendEmail({
    to: email,
    subject: "\u{1F339} Red Rose Shop \u2014 Email Verify \u0995\u09B0\u09CB",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #c0392b, #e74c3c); padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 26px; letter-spacing: 1px; }
          .body { padding: 36px 32px; }
          .body p { color: #444; font-size: 15px; line-height: 1.7; }
          .btn { display: inline-block; margin: 24px 0; padding: 14px 36px; background: #c0392b; color: #fff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; }
          .footer { background: #f5f5f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
          .link-box { background: #f9f9f9; border: 1px dashed #ddd; border-radius: 6px; padding: 12px; word-break: break-all; font-size: 13px; color: #666; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u{1F339} Red Rose Cosmetic Shop</h1>
          </div>
          <div class="body">
            <p>WELCOME <strong>${name}</strong>!</p>
            <p>\u09A4\u09CB\u09AE\u09BE\u09B0 account verify \u0995\u09B0\u09A4\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 button \u098F click \u0995\u09B0\u09CB\u0964 \u098F\u0987 link \u099F\u09BF <strong>24 \u0998\u09A8\u09CD\u099F\u09BE</strong> \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 valid \u09A5\u09BE\u0995\u09AC\u09C7\u0964</p>
            <div style="text-align:center;">
              <a href="${verificationUrl}" class="btn">\u2705 Email Verify \u0995\u09B0\u09CB</a>
            </div>
            <p style="font-size:13px; color:#888;">Button \u0995\u09BE\u099C \u09A8\u09BE \u0995\u09B0\u09B2\u09C7 \u098F\u0987 link \u099F\u09BF browser \u098F paste \u0995\u09B0\u09CB:</p>
            <div class="link-box">${verificationUrl}</div>
          </div>
          <div class="footer">
            <p>\u098F\u0987 email \u09A4\u09C1\u09AE\u09BF request \u0995\u09B0\u09CB\u09A8\u09BF? \u09A4\u09BE\u09B9\u09B2\u09C7 ignore \u0995\u09B0\u09CB\u0964</p>
            <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Red Rose Cosmetic Shop</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};
var sendPasswordResetEmail = async (email, name, resetUrl) => {
  await sendEmail({
    to: email,
    subject: "\u{1F510} Red Rose Shop \u2014 Password Reset",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #c0392b, #e74c3c); padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 26px; }
          .body { padding: 36px 32px; }
          .body p { color: #444; font-size: 15px; line-height: 1.7; }
          .btn { display: inline-block; margin: 24px 0; padding: 14px 36px; background: #c0392b; color: #fff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; }
          .footer { background: #f5f5f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
          .link-box { background: #f9f9f9; border: 1px dashed #ddd; border-radius: 6px; padding: 12px; word-break: break-all; font-size: 13px; color: #666; margin-top: 16px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #856404; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u{1F339} Red Rose Cosmetic Shop</h1>
          </div>
          <div class="body">
            <p>\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB <strong>${name}</strong>,</p>
            <p>\u09A4\u09CB\u09AE\u09BE\u09B0 account \u098F\u09B0 password reset \u0995\u09B0\u09BE\u09B0 request \u09AA\u09C7\u09AF\u09BC\u09C7\u099B\u09BF\u0964 \u09A8\u09BF\u099A\u09C7\u09B0 button \u098F click \u0995\u09B0\u09CB:</p>
            <div style="text-align:center;">
              <a href="${resetUrl}" class="btn">\u{1F510} Password Reset \u0995\u09B0\u09CB</a>
            </div>
            <div class="warning">\u26A0\uFE0F \u098F\u0987 link \u099F\u09BF <strong>1 \u0998\u09A8\u09CD\u099F\u09BE</strong> \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 valid\u0964 \u09A4\u09C1\u09AE\u09BF request \u09A8\u09BE \u0995\u09B0\u09B2\u09C7 \u098F\u0987 email ignore \u0995\u09B0\u09CB\u0964</div>
            <p style="font-size:13px; color:#888; margin-top:16px;">Button \u0995\u09BE\u099C \u09A8\u09BE \u0995\u09B0\u09B2\u09C7:</p>
            <div class="link-box">${resetUrl}</div>
          </div>
          <div class="footer">
            <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Red Rose Cosmetic Shop</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};
var sendOrderConfirmationEmail = async (email, name, orderId, items, totalAmount, address, phone) => {
  const itemsHtml = items.map((item) => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">\u09F3${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`).join("");
  await sendEmail({
    to: email,
    subject: `\u{1F339} Order Confirmed \u2014 #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #c0392b, #e74c3c); padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { padding: 32px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f5f5f5; padding: 10px; text-align: left; font-size: 13px; color: #666; }
          .total-row td { font-weight: bold; font-size: 16px; padding: 14px 10px; border-top: 2px solid #c0392b; }
          .info-box { background: #fff8f8; border: 1px solid #f5c6c6; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .cod-badge { display: inline-block; background: #28a745; color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; }
          .footer { background: #f5f5f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u{1F339} Red Rose Cosmetic Shop</h1>
            <p style="color:rgba(255,255,255,0.85); margin:8px 0 0;">Order Confirmed! \u{1F389}</p>
          </div>
          <div class="body">
            <p>\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC <strong>${name}</strong>,</p>
            <p>\u09A4\u09CB\u09AE\u09BE\u09B0 order \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 placed \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 Order ID: <strong>#${orderId.slice(-8).toUpperCase()}</strong></p>

            <table>
              <thead>
                <tr>
                  <th>\u09AA\u09A3\u09CD\u09AF</th>
                  <th style="text-align:center;">\u09AA\u09B0\u09BF\u09AE\u09BE\u09A3</th>
                  <th style="text-align:right;">\u09AE\u09C2\u09B2\u09CD\u09AF</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="2">\u09AE\u09CB\u099F \u09AE\u09C2\u09B2\u09CD\u09AF</td>
                  <td style="text-align:right; color:#c0392b;">\u09F3${totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div class="info-box">
              <p style="margin:0 0 8px;"><strong>\u{1F4E6} \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE:</strong> ${address}</p>
              <p style="margin:0 0 8px;"><strong>\u{1F4DE} \u09AB\u09CB\u09A8:</strong> ${phone}</p>
              <p style="margin:0;"><strong>\u{1F4B3} \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F:</strong> <span class="cod-badge">\u{1F4B5} Cash on Delivery</span></p>
            </div>

            <p style="color:#666; font-size:14px;">\u09AA\u09A3\u09CD\u09AF \u09AA\u09CC\u0981\u099B\u09BE\u09A8\u09CB\u09B0 \u09B8\u09AE\u09AF\u09BC \u0995\u09CD\u09AF\u09BE\u09B6 \u09A6\u09BF\u09AF\u09BC\u09C7 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09AC\u09C7\u0964 \u0986\u09AE\u09B0\u09BE \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u09A4\u09CB\u09AE\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u0964</p>
          </div>
          <div class="footer">
            <p>\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6 Red Rose Cosmetic Shop \u098F order \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF! \u{1F339}</p>
            <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Red Rose Cosmetic Shop</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// src/lib/auth.js
var auth = betterAuth({
  baseURL: "https://s-redrose-1.onrender.com",
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, user.name, url);
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    callbackURL: "https://red-rose-seven.vercel.app/login",
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, user.name, url);
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false
      }
    }
  },
  trustedOrigins: [process.env.FRONTEND_URL || "https://red-rose-seven.vercel.app"],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false
    }
  }
});

// src/routes/index.js
import { Router } from "express";
import multer from "multer";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// src/middlewares/authMiddleware.js
var requireAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session?.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first."
      });
      return;
    }
    req.user = session.user;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session."
    });
  }
};
var requireAdmin = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session?.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first."
      });
      return;
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    if (!dbUser || dbUser.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Forbidden. Admin access required."
      });
      return;
    }
    req.user = { ...session.user, role: dbUser.role };
    next();
  } catch {
    res.status(403).json({
      success: false,
      message: "Access denied."
    });
  }
};

// src/controllers/productController.js
var createSlug = (name) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") + "-" + Date.now();
var getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, page = "1", limit = "12" } = req.query;
    const where = { isActive: true };
    if (category)
      where.category = { slug: category };
    if (search)
      where.name = { contains: search, mode: "insensitive" };
    if (minPrice ?? maxPrice) {
      where.OR = [
        {
          salePrice: {
            gte: Number(minPrice) || 0,
            lte: Number(maxPrice) || 999999
          }
        },
        {
          regularPrice: {
            gte: Number(minPrice) || 0,
            lte: Number(maxPrice) || 999999
          }
        }
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          reviews: { select: { rating: true } }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.count({ where })
    ]);
    const productsWithRating = products.map((p) => ({
      ...p,
      avgRating: p.reviews.length > 0 ? p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length : null,
      totalReviews: p.reviews.length
    }));
    res.json({
      success: true,
      data: productsWithRating,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getProductBySlug = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var createProduct = async (req, res) => {
  try {
    const { name, description, regularPrice, salePrice, stock, categoryId, hoverImg } = req.body;
    if (!name || !regularPrice) {
      res.status(400).json({ success: false, message: "Name and regular price are required" });
      return;
    }
    const mainImg = req.file?.filename ?? req.body.mainImg;
    if (!mainImg) {
      res.status(400).json({ success: false, message: "Main image is required" });
      return;
    }
    const product = await prisma.product.create({
      data: {
        name,
        slug: createSlug(name),
        description,
        regularPrice: parseFloat(regularPrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        mainImg,
        hoverImg,
        stock: parseInt(stock ?? "0"),
        categoryId: categoryId ?? null
      }
    });
    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (req.file?.filename)
      updateData.mainImg = req.file.filename;
    if (updateData.regularPrice)
      updateData.regularPrice = parseFloat(updateData.regularPrice);
    if (updateData.salePrice)
      updateData.salePrice = parseFloat(updateData.salePrice);
    if (updateData.stock)
      updateData.stock = parseInt(updateData.stock);
    if (updateData.name)
      updateData.slug = createSlug(updateData.name);
    if (updateData.isActive !== void 0)
      updateData.isActive = updateData.isActive === "true";
    const product = await prisma.product.update({ where: { id }, data: updateData });
    res.json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// src/controllers/categoryController.js
var createSlug2 = (name) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
var getCategories = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file?.filename ?? req.body.image;
    if (!name) {
      res.status(400).json({ success: false, message: "Category name is required" });
      return;
    }
    const category = await prisma.category.create({
      data: { name, slug: createSlug2(name), image }
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = createSlug2(name);
    }
    if (req.file?.filename)
      updateData.image = req.file.filename;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// src/controllers/cartController.js
var getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                mainImg: true,
                regularPrice: true,
                salePrice: true,
                stock: true
              }
            }
          }
        }
      }
    });
    if (!cart) {
      res.json({ success: true, data: { items: [], total: 0 } });
      return;
    }
    const total = cart.items.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.regularPrice;
      return sum + price * item.quantity;
    }, 0);
    res.json({ success: true, data: { ...cart, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: "Insufficient stock" });
      return;
    }
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart)
      cart = await prisma.cart.create({ data: { userId } });
    const cartItem = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity }
    });
    res.json({ success: true, message: "Added to cart", data: cartItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      res.json({ success: true, message: "Item removed from cart" });
      return;
    }
    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var removeFromCart = async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart)
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// src/controllers/orderController.js
var VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];
var createOrder = async (req, res) => {
  try {
    const { items, address, city, postalCode, phone, note } = req.body;
    const userId = req.user.id;
    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: "Order items are required" });
      return;
    }
    if (!address || !phone || !city) {
      res.status(400).json({ success: false, message: "Address, city and phone are required" });
      return;
    }
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true }
    });
    if (products.length !== items.length) {
      res.status(400).json({ success: false, message: "One or more products not found" });
      return;
    }
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `"${product.name}" \u098F\u09B0 stock \u0995\u09AE\u0964 Available: ${product.stock}`
        });
        return;
      }
    }
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const price = product.salePrice ?? product.regularPrice;
      totalAmount += price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, price };
    });
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
      return tx.order.create({
        data: {
          userId,
          totalAmount,
          address,
          city,
          postalCode,
          phone,
          note,
          paymentMethod: "CASH_ON_DELIVERY",
          paymentStatus: "UNPAID",
          items: { create: orderItems }
        },
        include: {
          items: {
            include: {
              product: { select: { name: true, mainImg: true } }
            }
          },
          user: { select: { name: true, email: true } }
        }
      });
    });
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId: { in: productIds } }
      });
    }
    try {
      const emailItems = order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.price
      }));
      await sendOrderConfirmationEmail(order.user.email, order.user.name, order.id, emailItems, order.totalAmount, `${order.address}, ${order.city}`, order.phone);
    } catch (emailErr) {
      console.error("Order confirmation email failed:", emailErr);
    }
    res.status(201).json({
      success: true,
      message: "Order placed successfully! Confirmation email \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964",
      data: {
        orderId: order.id,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        items: order.items
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: { select: { name: true, mainImg: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { product: { select: { name: true, mainImg: true, slug: true } } }
        }
      }
    });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getAllOrders = async (req, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" }
      }),
      prisma.order.count({ where })
    ]);
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }
    const updateData = {
      status
    };
    if (status === "DELIVERED") {
      updateData.paymentStatus = "PAID";
    }
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: { user: { select: { name: true, email: true } } }
    });
    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if (order.userId !== req.user.id) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    if (order.status !== "PENDING") {
      res.status(400).json({
        success: false,
        message: `Order already ${order.status}. Cancel \u0995\u09B0\u09BE \u09AF\u09BE\u09AC\u09C7 \u09A8\u09BE\u0964`
      });
      return;
    }
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" }
      });
    });
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// src/generated/prisma/enums.js
var Role = {
  USER: "USER",
  ADMIN: "ADMIN"
};

// src/controllers/userController.js
var getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true
      }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file?.filename;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...name && { name },
        ...image && { image }
      },
      select: { id: true, name: true, email: true, image: true, role: true }
    });
    res.json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count()
    ]);
    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!Object.values(Role).includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role. Must be USER or ADMIN"
      });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({ success: true, message: `User role changed to ${role}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getDashboardStats = async (_req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenue, recentOrders, lowStockProducts] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { totalAmount: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } }
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        select: { id: true, name: true, stock: true },
        take: 10
      })
    ]);
    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenue._sum.totalAmount ?? 0,
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// src/controllers/reviewController.js
var addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      return;
    }
    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { rating: Number(rating), comment },
      create: { userId: req.user.id, productId, rating: Number(rating), comment },
      include: { user: { select: { name: true, image: true } } }
    });
    res.status(201).json({ success: true, message: "Review submitted", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var deleteReview = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found" });
      return;
    }
    if (review.userId !== req.user.id && req.user.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// src/routes/index.js
var __dirname = path2.dirname(fileURLToPath2(import.meta.url));
var uploadDir = path2.join(__dirname, "../../uploads");
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path2.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/"))
      cb(null, true);
    else
      cb(new Error("Only image files are allowed!"));
  }
});
var router = Router();
router.get("/products", getAllProducts);
router.get("/products/:slug", getProductBySlug);
router.get("/categories", getCategories);
router.get("/user/profile", requireAuth, getProfile);
router.put("/user/profile", requireAuth, upload.single("image"), updateProfile);
router.get("/cart", requireAuth, getCart);
router.post("/cart", requireAuth, addToCart);
router.put("/cart/item/:itemId", requireAuth, updateCartItem);
router.delete("/cart/item/:itemId", requireAuth, removeFromCart);
router.delete("/cart", requireAuth, clearCart);
router.post("/orders", requireAuth, createOrder);
router.get("/orders/my", requireAuth, getMyOrders);
router.get("/orders/:id", requireAuth, getOrderById);
router.patch("/orders/:id/cancel", requireAuth, cancelOrder);
router.post("/reviews", requireAuth, addReview);
router.delete("/reviews/:id", requireAuth, deleteReview);
router.get("/admin/dashboard", requireAdmin, getDashboardStats);
router.post("/admin/products", requireAdmin, upload.single("mainImg"), createProduct);
router.put("/admin/products/:id", requireAdmin, upload.single("mainImg"), updateProduct);
router.delete("/admin/products/:id", requireAdmin, deleteProduct);
router.post("/admin/categories", requireAdmin, upload.single("image"), createCategory);
router.put("/admin/categories/:id", requireAdmin, upload.single("image"), updateCategory);
router.delete("/admin/categories/:id", requireAdmin, deleteCategory);
router.get("/admin/orders", requireAdmin, getAllOrders);
router.put("/admin/orders/:id/status", requireAdmin, updateOrderStatus);
router.get("/admin/users", requireAdmin, getAllUsers);
router.put("/admin/users/:id/role", requireAdmin, changeUserRole);
var routes_default = router;

// src/app.js
var app = express();
var __dirname2 = path3.dirname(fileURLToPath3(import.meta.url));
var uploadDir2 = path3.join(__dirname2, "../uploads");
if (!fs.existsSync(uploadDir2)) {
  fs.mkdirSync(uploadDir2, { recursive: true });
}
app.use(cors({
  origin: [
    process.env.FRONTEND_URL ?? "https://red-rose-seven.vercel.app",
    "http://localhost:5173",
    "https://red-rose-seven.vercel.app",
    "https://s-redrose-1.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.all("/api/auth/*all", toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path3.join(__dirname2, "../uploads")));
app.use("/api", routes_default);
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Red Rose Cosmetic Shop API is running \u{1F339}",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("*all", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});
app.use((err, _req, res, _next) => {
  console.error("\u274C Error:", err.message);
  res.status(err.status ?? 500).json({
    success: false,
    message: err.message ?? "Internal Server Error"
  });
});
var app_default = app;

// src/server.ts
var PORT = process.env.PORT || 5e3;
app_default.listen(PORT, () => {
  console.log(`
\u{1F339} \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 \u{1F339}
   Red Rose Cosmetic Shop \u2014 Backend
\u{1F680} Server  : http://localhost:${PORT}
\u{1F3E5} Health  : http://localhost:${PORT}/health
\u{1F4E6} Database: SQLite via Prisma ORM
\u{1F510} Auth    : Better Auth (Email + Google)
\u{1F4B5} Payment : Cash on Delivery
\u{1F339} \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 \u{1F339}
  `);
});
var server_default = app_default;
export {
  server_default as default
};
