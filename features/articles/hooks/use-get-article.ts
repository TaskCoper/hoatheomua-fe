import { useQuery } from '@tanstack/react-query'
import { getArticleQuery } from '../queries'
import articleService from '../services'

export interface GetArticleParams {
  identifier: string
}

export const useGetArticle = ({ identifier }: GetArticleParams) => {
  const { data: article, isLoading: isLoadingArticle } = useQuery({
    ...getArticleQuery({ identifier }),
    queryFn: () => articleService.getArticle({ identifier })
  })

  return { article, isLoadingArticle }
}
