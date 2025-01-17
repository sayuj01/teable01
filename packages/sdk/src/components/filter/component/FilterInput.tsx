import type { IFilterItem } from '@teable/core';
import { Input, cn } from '@teable/ui-lib';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../../context/app/i18n';

interface InputProps {
  value: IFilterItem['value'];
  onChange: (value: string | null) => void;
  placeholder: string;
  className?: string;
}

const FilterInput = (props: InputProps) => {
  const { t } = useTranslation();
  const { onChange, placeholder = t('filter.default.placeholder'), value, className } = props;
  const [input, setInput] = useState<string>((value as string) ?? '');

  useEffect(() => {
    if (!['string', 'number'].includes(typeof value)) {
      onChange(null);
    }
  }, [onChange, value]);

  return (
    <Input
      placeholder={placeholder}
      value={input}
      onChange={(e) => {
        setInput(e.target.value);
        onChange(e.target.value ?? null);
      }}
      className={cn('m-1 h-8 placeholder:text-[13px]', className)}
    />
  );
};

export { FilterInput };
