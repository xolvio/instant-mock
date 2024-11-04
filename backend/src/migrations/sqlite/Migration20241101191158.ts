import { Migration } from '@mikro-orm/migrations';

export class Migration20241101191158 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`seed_group\` (\`id\` integer not null primary key autoincrement, \`name\` text not null);`);
    this.addSql(`create unique index \`seed_group_name_unique\` on \`seed_group\` (\`name\`);`);

    this.addSql(`create table \`seed\` (\`id\` integer not null primary key autoincrement, \`graph_id\` text not null, \`variant_name\` text not null, \`operation_name\` text not null, \`seed_response\` json not null, \`operation_match_arguments\` json not null, \`seed_group_id\` integer not null, constraint \`seed_seed_group_id_foreign\` foreign key(\`seed_group_id\`) references \`seed_group\`(\`id\`) on update cascade);`);
    this.addSql(`create index \`seed_seed_group_id_index\` on \`seed\` (\`seed_group_id\`);`);
  }

}
