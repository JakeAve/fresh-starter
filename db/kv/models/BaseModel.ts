export class BaseModel {
  #key;

  constructor(key: Deno.KvKey) {
    this.#key = key;
  }
}
