/* eslint-disable @typescript-eslint/naming-convention */
import type {
  IAggregationRo,
  IFieldRo,
  IRowCountRo,
  IUpdateFieldRo,
  NotificationStatesEnum,
} from '@teable-group/core';
import type {
  IShareViewRowCountQueryRo,
  IShareViewAggregationsQueryRo,
} from '@teable-group/openapi';

export type ReactQueryKeys = {
  spaceCollaboratorList: (spaceId: string) => [string, string];

  baseCollaboratorList: (baseId: string) => [string, string];

  notifyList: (filter: { status: NotificationStatesEnum }) => [string, string, unknown];
  notifyUnreadCount: () => [string, string];

  rowCount: (tableId: string, query: IRowCountRo) => [string, string, IRowCountRo];
  aggregations: (tableId: string, query: IAggregationRo) => [string, string, IAggregationRo];

  shareViewRowCount: (
    shareId: string,
    query: IShareViewRowCountQueryRo
  ) => [string, string, IShareViewRowCountQueryRo];
  shareViewAggregations: (
    shareId: string,
    query: IShareViewAggregationsQueryRo
  ) => [string, string, IShareViewAggregationsQueryRo];
  planFieldCreate: (tableId: string, fieldRo: IFieldRo) => [string, string, IFieldRo];

  planFieldUpdate: (
    tableId: string,
    fieldId: string,
    fieldRo: IUpdateFieldRo
  ) => [string, string, string, IUpdateFieldRo];

  planField: (tableId: string, fieldId: string) => [string, string, string];
};

export const ReactQueryKeys: ReactQueryKeys = {
  spaceCollaboratorList: (spaceId) => ['space-collaborator-list', spaceId],

  baseCollaboratorList: (baseId) => ['base-collaborator-list', baseId],

  notifyList: (filter) => ['notification', 'list', filter],
  notifyUnreadCount: () => ['notification', 'unread-count'],

  rowCount: (tableId, query) => ['row-count', tableId, query],
  aggregations: (tableId, query) => ['aggregations', tableId, query],

  shareViewRowCount: (shareId, query) => ['share-view-row-count', shareId, query],
  shareViewAggregations: (shareId, query) => ['share-view-aggregations', shareId, query],

  planFieldCreate: (tableId, fieldRo) => ['create-field-plan', tableId, fieldRo],

  planFieldUpdate: (tableId, fieldId, fieldRo) => ['create-field-plan', tableId, fieldId, fieldRo],

  planField: (tableId, fieldId) => ['field-plan', tableId, fieldId],
};