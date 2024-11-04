import {Migration} from '@mikro-orm/migrations';

export class Migration20241023195535 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "seed" ("id" serial primary key, "graph_id" varchar(255) not null, "variant_name" varchar(255) not null, "operation_name" varchar(255) not null, "seed_response" jsonb not null, "operation_match_arguments" jsonb not null, "seed_group_id" varchar(255) not null);`
    );
  }
}
