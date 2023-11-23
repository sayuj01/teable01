import { CellValueType, ColorUtils, FieldType } from '@teable-group/core';
import type {
  IAttachmentCellValue,
  INumberFieldOptions,
  INumberShowAs,
  ISingleLineTextShowAs,
} from '@teable-group/core';
import { LRUCache } from 'lru-cache';
import { useMemo } from 'react';
import colors from 'tailwindcss/colors';
import type { IGridColumn, ICell, INumberShowAs as IGridNumberShowAs, ChartType } from '../..';
import { NumberEditor, onMixedTextClick, CellType, EditorPosition, getFileCover } from '../..';
import { useTablePermission } from '../../../hooks';
import { useFields } from '../../../hooks/use-fields';
import { useViewId } from '../../../hooks/use-view-id';
import type { IFieldInstance, Record } from '../../../model';
import { GRID_DEFAULT } from '../../grid/configs';
import { GridAttachmentEditor, GridDateEditor, GridLinkEditor } from '../editor';

const cellValueStringCache: LRUCache<string, string> = new LRUCache({ max: 1000 });

const generateColumns = (
  fields: IFieldInstance[],
  viewId?: string,
  hasMenu: boolean = true
): (IGridColumn & { id: string })[] => {
  const iconString = (type: FieldType, isLookup: boolean | undefined) => {
    return isLookup ? `${type}_lookup` : type;
  };

  return fields
    .map((field) => {
      if (!field) return undefined;
      const columnMeta = viewId ? field.columnMeta[viewId] : null;
      const width = columnMeta?.width || GRID_DEFAULT.columnWidth;
      const { id, type, name, description, isLookup } = field;
      return {
        id,
        name,
        width,
        description,
        customTheme: field.hasError ? { columnHeaderBg: colors.rose[100] } : undefined,
        hasMenu,
        icon: iconString(type, isLookup),
      };
    })
    .filter(Boolean) as (IGridColumn & { id: string })[];
};

const createCellValue2GridDisplay =
  (fields: IFieldInstance[], editable: boolean) =>
  // eslint-disable-next-line sonarjs/cognitive-complexity
  (record: Record, col: number): ICell => {
    const field = fields[col];

    if (field == null) return { type: CellType.Loading };

    const { id, type, isComputed, isMultipleCellValue: isMultiple, cellValueType } = field;
    const cellValue = record.getCellValue(id);
    const readonly = isComputed || !editable;

    switch (type) {
      case FieldType.SingleLineText: {
        const { showAs } = field.options;

        if (showAs != null) {
          const { type } = showAs;

          return {
            type: CellType.Link,
            data: cellValue ? (Array.isArray(cellValue) ? cellValue : [cellValue]) : [],
            displayData: field.cellValue2String(cellValue),
            readonly,
            onClick: (text) => onMixedTextClick(type, text),
          };
        }

        return {
          type: CellType.Text,
          data: (cellValue as string) || '',
          displayData: field.cellValue2String(cellValue),
          readonly,
        };
      }
      case FieldType.LongText: {
        return {
          type: CellType.Text,
          data: (cellValue as string) || '',
          displayData: field.cellValue2String(cellValue),
          readonly,
          isWrap: true,
        };
      }
      case FieldType.Date: {
        let displayData = '';
        const { date, time, timeZone } = field.options.formatting;
        const cacheKey = `${id}-${cellValue}-${date}-${time}-${timeZone}`;

        if (cellValueStringCache.has(cacheKey)) {
          displayData = cellValueStringCache.get(cacheKey) || '';
        } else {
          displayData = field.cellValue2String(cellValue);
          cellValueStringCache.set(cacheKey, displayData);
        }
        return {
          type: CellType.Text,
          data: (cellValue as string) || '',
          displayData,
          readonly,
          editorPosition: EditorPosition.Below,
          customEditor: (props) => <GridDateEditor field={field} record={record} {...props} />,
        };
      }
      case FieldType.Number:
      case FieldType.Rollup:
      case FieldType.Formula: {
        if (cellValueType === CellValueType.Boolean) {
          return {
            type: CellType.Boolean,
            data: (cellValue as boolean) || false,
            readonly,
            isMultiple,
          };
        }

        if (cellValueType === CellValueType.DateTime) {
          return {
            type: CellType.Text,
            data: (cellValue as string) || '',
            displayData: field.cellValue2String(cellValue),
            readonly,
          };
        }

        if (cellValueType === CellValueType.String) {
          const showAs = field.options.showAs as ISingleLineTextShowAs;

          if (showAs != null) {
            const { type } = showAs;

            return {
              type: CellType.Link,
              data: cellValue ? (Array.isArray(cellValue) ? cellValue : [cellValue]) : [],
              displayData: field.cellValue2String(cellValue),
              readonly,
              onClick: (text) => onMixedTextClick(type, text),
            };
          }

          return {
            type: CellType.Text,
            data: (cellValue as string) || '',
            displayData: field.cellValue2String(cellValue),
            readonly,
          };
        }

        const optionShowAs = field.options.showAs as INumberShowAs;
        const showAs =
          optionShowAs == null
            ? undefined
            : {
                ...optionShowAs,
                color: ColorUtils.getHexForColor(optionShowAs.color),
              };

        if (showAs && isMultiple && Array.isArray(cellValue)) {
          return {
            type: CellType.Chart,
            data: cellValue as number[],
            displayData: cellValue.map((v) => field.item2String(v)),
            readonly,
            chartType: showAs.type as unknown as ChartType,
            color: showAs.color,
          };
        }

        const onChange = (value: unknown) => {
          record.updateCell(field.id, value ?? null);
        };

        return {
          type: CellType.Number,
          data: cellValue as number,
          displayData: field.cellValue2String(cellValue),
          readonly,
          showAs: showAs as unknown as IGridNumberShowAs,
          customEditor: (props, editorRef) => (
            <NumberEditor
              ref={editorRef}
              value={cellValue as number}
              options={field.options as INumberFieldOptions}
              onChange={onChange}
              {...props}
            />
          ),
        };
      }
      case FieldType.MultipleSelect:
      case FieldType.SingleSelect: {
        const data = cellValue ? (Array.isArray(cellValue) ? cellValue : [cellValue]) : [];
        const choices = field.options.choices.map(({ name, color }) => {
          return {
            name,
            bgColor: ColorUtils.getHexForColor(color),
            textColor: ColorUtils.shouldUseLightTextOnColor(color) ? '#FFFFFF' : '#000000',
          };
        });
        return {
          type: CellType.Select,
          data,
          choices,
          readonly,
          isMultiple,
          editorPosition: EditorPosition.Below,
        };
      }
      case FieldType.Link: {
        const cv = cellValue ? (Array.isArray(cellValue) ? cellValue : [cellValue]) : [];
        const data = cv.map(({ title }) => title || 'Untitled');
        const choices = cv.map(({ id, title }) => ({ id, name: title }));
        return {
          type: CellType.Select,
          data,
          choices,
          readonly,
          isMultiple,
          editorPosition: EditorPosition.Below,
          customEditor: (props) => <GridLinkEditor field={field} record={record} {...props} />,
        };
      }
      case FieldType.Attachment: {
        const cv = (cellValue ?? []) as IAttachmentCellValue;
        const data = cv.map(({ id, mimetype, url }) => ({ id, url: getFileCover(mimetype, url) }));
        const displayData = data.map(({ url }) => url);
        return {
          type: CellType.Image,
          data,
          displayData,
          readonly,
          customEditor: (props) => (
            <GridAttachmentEditor field={field} record={record} {...props} />
          ),
        };
      }
      case FieldType.Checkbox: {
        return {
          type: CellType.Boolean,
          data: (cellValue as boolean) || false,
          readonly,
          isMultiple,
        };
      }
      case FieldType.Rating: {
        const { icon, color, max } = field.options;

        if (isMultiple) {
          return {
            type: CellType.Number,
            data: cellValue as number,
            displayData: field.cellValue2String(cellValue),
            readonly,
          };
        }

        return {
          type: CellType.Rating,
          data: (cellValue as number) || 0,
          readonly,
          icon,
          color: ColorUtils.getHexForColor(color),
          max,
        };
      }
      default: {
        return { type: CellType.Loading };
      }
    }
  };

export function useGridColumns(hasMenu?: boolean) {
  const viewId = useViewId();
  const fields = useFields();
  const permission = useTablePermission();
  const editable = permission['record|update'];

  return useMemo(
    () => ({
      columns: generateColumns(fields, viewId, hasMenu),
      cellValue2GridDisplay: createCellValue2GridDisplay(fields, editable),
    }),
    [fields, viewId, editable, hasMenu]
  );
}