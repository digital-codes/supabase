import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { operations } from 'api-types'
import { get, handleError } from 'data/fetchers'
import type { AnalyticsData, AnalyticsInterval } from './constants'
import { analyticsKeys } from './keys'

export type ProjectDailyStatsAttribute =
  operations['DailyStatsController_getDailyStats']['parameters']['query']['attribute']

export type ProjectDailyStatsVariables = {
  projectRef?: string
  attribute: ProjectDailyStatsAttribute
  startDate?: string
  endDate?: string
  interval?: AnalyticsInterval
  dateFormat?: string
  databaseIdentifier?: string
  modifier?: (x: number) => number
}

export async function getProjectDailyStats(
  {
    projectRef,
    attribute,
    startDate,
    endDate,
    interval = '1d',
    databaseIdentifier,
  }: ProjectDailyStatsVariables,
  signal?: AbortSignal
) {
  if (!projectRef) throw new Error('Project ref is required')
  if (!attribute) throw new Error('Attribute is required')
  if (!startDate) throw new Error('Start date is required')
  if (!endDate) throw new Error('End date is required')

  const { data, error } = await get('/platform/projects/{ref}/daily-stats', {
    params: {
      path: { ref: projectRef },
      query: {
        attribute,
        startDate,
        endDate,
        interval,
        // [Joshen] TODO: Once API support is ready
        // databaseIdentifier,
      },
    },
    signal,
  })

  if (error) handleError(error)
  return data as unknown as AnalyticsData
}

export type ProjectDailyStatsData = Awaited<ReturnType<typeof getProjectDailyStats>>
export type ProjectDailyStatsError = unknown

export const useProjectDailyStatsQuery = <TData = ProjectDailyStatsData>(
  {
    projectRef,
    attribute,
    startDate,
    endDate,
    interval = '1d',
    dateFormat = 'DD MMM',
    databaseIdentifier,
    modifier,
  }: ProjectDailyStatsVariables,
  {
    enabled = true,
    ...options
  }: UseQueryOptions<ProjectDailyStatsData, ProjectDailyStatsError, TData> = {}
) =>
  useQuery<ProjectDailyStatsData, ProjectDailyStatsError, TData>(
    analyticsKeys.infraMonitoring(projectRef, {
      attribute,
      startDate,
      endDate,
      interval,
      databaseIdentifier,
    }),
    ({ signal }) =>
      getProjectDailyStats(
        { projectRef, attribute, startDate, endDate, interval, databaseIdentifier },
        signal
      ),
    {
      enabled:
        enabled &&
        typeof projectRef !== 'undefined' &&
        typeof attribute !== 'undefined' &&
        typeof startDate !== 'undefined' &&
        typeof endDate !== 'undefined',
      select(data) {
        return {
          ...data,
          data: data.data.map((x) => {
            return {
              ...x,
              [attribute]:
                modifier !== undefined ? modifier(Number(x[attribute])) : Number(x[attribute]),
              periodStartFormatted: dayjs(x.period_start).format(dateFormat),
            }
          }),
        } as TData
      },
      staleTime: 1000 * 60, // default good for a minute
      ...options,
    }
  )
