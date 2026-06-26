import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server'

export const productsSearchParsers = {
  category: parseAsInteger,
  q: parseAsString.withDefault(''),
  pmin: parseAsInteger,
  pmax: parseAsInteger
}

export const loadProductsSearch = createLoader(productsSearchParsers)
