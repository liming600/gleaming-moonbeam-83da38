export interface QueryResult<T> {
  data: T | null
  error: Error | null
}

export interface QueryResultList<T> {
  data: T[]
  error: Error | null
}

export const executeQuery = async <T>(
  query: PromiseLike<{ data: T[] | null; error: Error | null }>
): Promise<QueryResultList<T>> => {
  try {
    const { data, error } = await query
    return { data: data || [], error: error || null }
  } catch (error) {
    return { data: [], error: error as Error }
  }
}

export const executeSingleQuery = async <T>(
  query: PromiseLike<{ data: T | null; error: Error | null }>
): Promise<QueryResult<T>> => {
  try {
    const { data, error } = await query
    return { data, error: error || null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}