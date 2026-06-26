import { useLocale } from '@/lib/i18n/dictionary-provider'
import { useQuery } from '@tanstack/react-query'
import { getArticleQuery } from '../queries'
import articleService from '../services'

export interface GetArticleParams {
  identifier: string
}

export const useGetArticle = ({ identifier }: GetArticleParams) => {
  const locale = useLocale()

  const { data: article, isLoading: isLoadingArticle } = useQuery({
    ...getArticleQuery({ identifier, locale }),
    queryFn: () => articleService.getArticle({ identifier, locale })
  })

  return { article, isLoadingArticle }
}
