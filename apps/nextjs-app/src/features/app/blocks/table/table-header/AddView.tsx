/* eslint-disable @typescript-eslint/naming-convention */
import { ViewType } from '@teable-group/core';
import { Plus } from '@teable-group/icons';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@teable-group/ui-lib/shadcn';
import { useState } from 'react';
import { VIEW_ICON_MAP } from '../../view/constant';
import { useAddView } from '../../view/list/useAddView';

const VIEW_INFO_LIST = [
  {
    name: 'Grid View',
    type: ViewType.Grid,
    Icon: VIEW_ICON_MAP[ViewType.Grid],
  },
  {
    name: 'Form View',
    type: ViewType.Form,
    Icon: VIEW_ICON_MAP[ViewType.Form],
  },
];

export const AddView: React.FC = () => {
  const addView = useAddView();
  const [isOpen, setOpen] = useState(false);

  const onClick = (type: ViewType, name: string) => {
    addView(type, name.split(' ')[0]);
    setOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="h-7 w-7 shrink-0 px-0" size={'xs'} variant={'outline'}>
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-40 p-0">
        {VIEW_INFO_LIST.map((item) => {
          const { name, type, Icon } = item;
          return (
            <Button
              key={type}
              variant={'ghost'}
              size={'xs'}
              className="w-full justify-start font-normal"
              onClick={() => onClick(type, name)}
            >
              <Icon className="pr-1 text-lg" />
              {name}
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};