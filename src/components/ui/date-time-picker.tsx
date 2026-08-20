import { useMemo, useState } from 'react';
import { CalendarIcon, Check, Clock3 } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const pickerButtonClass = 'h-10 w-full rounded-[5px] border border-input bg-field justify-start px-3 font-normal';

export interface DatePickerProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DatePicker({ value, placeholder = 'Pick a date', onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = (() => {
    if (!value) return undefined;
    const rawValue = String(value).trim();
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
      ? parse(rawValue, 'yyyy-MM-dd', new Date())
      : new Date(rawValue);
    return isValid(parsedDate) ? parsedDate : undefined;
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={cn(pickerButtonClass, !value && 'text-muted-foreground', className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, 'dd-MMM-yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-[5px] p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, 'yyyy-MM-dd'));
              setOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export interface TimePickerProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, placeholder = 'Pick a time', onChange, className }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const times = useMemo(
    () => Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`),
    [],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={cn(pickerButtonClass, !value && 'text-muted-foreground', className)}>
          <Clock3 className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-[5px] p-0">
        <Command>
          <CommandInput placeholder="Search time..." />
          <CommandList className="max-h-56">
            <CommandEmpty>No times found.</CommandEmpty>
            <CommandGroup>
              {times.map((time) => (
                <CommandItem key={time} value={time} onSelect={() => { onChange(time); setOpen(false); }}>
                  {time}
                  <Check className={cn('ml-auto h-4 w-4', value === time ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
