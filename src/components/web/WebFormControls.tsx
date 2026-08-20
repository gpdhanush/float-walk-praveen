import { useMemo, useState } from 'react';
import { CalendarIcon, Check, ChevronsUpDown, Clock3 } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const controlClass = 'mt-2 h-10 rounded-[5px] border-border bg-background';

export function WebSelect({ value, options, placeholder, onChange }: { value: string; options: string[]; placeholder: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" className={cn('w-full justify-between px-3 font-normal', controlClass, !value && 'text-muted-foreground')}><span className="truncate">{value || placeholder}</span><ChevronsUpDown className="h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="font-web w-[var(--radix-popover-trigger-width)] p-0 rounded-[5px]"><Command><CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} /><CommandList><CommandEmpty>No options found.</CommandEmpty><CommandGroup>{options.map((option) => <CommandItem key={option} value={option} onSelect={() => { onChange(option); setOpen(false); }}>{option}<Check className={cn('ml-auto h-4 w-4', value === option ? 'opacity-100' : 'opacity-0')} /></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>;
}

export function WebDatePicker({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = (() => {
    if (!value) return undefined;
    const rawValue = String(value).trim();
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
      ? parse(rawValue, 'yyyy-MM-dd', new Date())
      : new Date(rawValue);
    return isValid(parsedDate) ? parsedDate : undefined;
  })();
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" className={cn('w-full justify-start px-3 font-normal', controlClass, !value && 'text-muted-foreground')}><CalendarIcon className="mr-2 h-4 w-4" />{selected ? format(selected, 'dd-MMM-yyyy') : placeholder}</Button></PopoverTrigger><PopoverContent className="font-web w-auto p-0 rounded-[5px]"><Calendar mode="single" selected={selected} onSelect={(date) => { if (date) { onChange(format(date, 'yyyy-MM-dd')); setOpen(false); } }} initialFocus /></PopoverContent></Popover>;
}

export function WebTimePicker({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const times = useMemo(() => Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`), []);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" className={cn('w-full justify-start px-3 font-normal', controlClass, !value && 'text-muted-foreground')}><Clock3 className="mr-2 h-4 w-4" />{value || placeholder}</Button></PopoverTrigger><PopoverContent className="font-web w-[var(--radix-popover-trigger-width)] p-0 rounded-[5px]"><Command><CommandInput placeholder="Search time..." /><CommandList className="max-h-56"><CommandGroup>{times.map((time) => <CommandItem key={time} value={time} onSelect={() => { onChange(time); setOpen(false); }}>{time}<Check className={cn('ml-auto h-4 w-4', value === time ? 'opacity-100' : 'opacity-0')} /></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>;
}