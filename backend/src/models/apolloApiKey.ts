import {Entity, PrimaryKey, Property} from '@mikro-orm/core';
import {Encryption} from '../utilities/encryption';

@Entity()
export class ApolloApiKey {
  @PrimaryKey()
  id: number = 1;

  @Property()
  encryptedKey!: string;

  @Property()
  iv!: string;

  @Property()
  tag!: string;

  constructor(key: string) {
    if (!key) throw new Error('API key cannot be empty');
    const encrypted = Encryption.encrypt(key);
    this.encryptedKey = encrypted.encryptedData;
    this.iv = encrypted.iv;
    this.tag = encrypted.tag;
  }

  getDecryptedKey(): string {
    return Encryption.decrypt(this.encryptedKey, this.iv, this.tag);
  }

  static create(key: string): ApolloApiKey {
    const apiKey = new ApolloApiKey(key);
    apiKey.id = 1;
    return apiKey;
  }
}
