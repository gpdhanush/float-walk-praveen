import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  className?: string;
}

const titleCase = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

export function SearchableSelect({ value, options, placeholder, onChange, searchable = true, className }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchPlaceholder = `Search ${placeholder.toLowerCase()}...`;
  const filteredOptions = options.filter((option) => {
    const normalizedQuery = query.trim().toLowerCase();
    return !normalizedQuery || option.toLowerCase().includes(normalizedQuery) || titleCase(option).toLowerCase().includes(normalizedQuery);
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={cn('mt-2 h-10 w-full justify-between rounded-[5px] border-border bg-field px-3 font-normal', !value && 'text-muted-foreground', className)}>
          <span className="truncate">{value ? titleCase(value) : placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-[5px] p-0">
        <Command>
          {searchable && <CommandInput value={query} onValueChange={setQuery} placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{query ? 'No options found.' : 'No options available.'}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem key={option} value={option} onSelect={() => { onChange(option); setOpen(false); setQuery(''); }}>
                  {titleCase(option)}
                  <Check className={cn('ml-auto h-4 w-4', value === option ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
