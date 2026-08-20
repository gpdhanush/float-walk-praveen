import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker, TimePicker } from '@/components/ui/date-time-picker';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const controlClass = 'mt-2 h-10 rounded-[5px] border-border bg-field';

export function WebSelect({ value, options, placeholder, onChange }: { value: string; options: string[]; placeholder: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" className={cn('w-full justify-between px-3 font-normal', controlClass, !value && 'text-muted-foreground')}><span className="truncate">{value || placeholder}</span><ChevronsUpDown className="h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="font-web w-[var(--radix-popover-trigger-width)] p-0 rounded-[5px]"><Command><CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} /><CommandList><CommandEmpty>No options found.</CommandEmpty><CommandGroup>{options.map((option) => <CommandItem key={option} value={option} onSelect={() => { onChange(option); setOpen(false); }}>{option}<Check className={cn('ml-auto h-4 w-4', value === option ? 'opacity-100' : 'opacity-0')} /></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>;
}

export const WebDatePicker = DatePicker;

export const WebTimePicker = TimePicker;