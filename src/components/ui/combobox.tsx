"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/src/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover"

export interface Recipient {
    value: string
    label: string
    description: string
}

interface ComboboxProps {
    recipients: Recipient[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    emptyText?: string
    searchPlaceholder?: string
}

export function RecipientCombobox({
    recipients,
    value,
    onValueChange,
    placeholder = "Select recipient...",
    emptyText = "No recipient found.",
    searchPlaceholder = "Search recipients..."
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10 rounded-xl border-2 border-slate-200/60 bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 text-sm shadow-sm hover:shadow-md text-left font-normal"
                >
                    {value
                        ? recipients.find((recipient) => recipient.value === value)?.label
                        : <span className="text-slate-400">{placeholder}</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-9" />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {recipients.map((recipient) => (
                                <CommandItem
                                    key={recipient.value}
                                    value={`${recipient.label} ${recipient.description}`}
                                    onSelect={(currentValue) => {
                                        // Find the recipient by matching the searchable text
                                        const selectedRecipient = recipients.find(r =>
                                            `${r.label} ${r.description}` === currentValue
                                        );
                                        if (selectedRecipient) {
                                            onValueChange(selectedRecipient.value === value ? "" : selectedRecipient.value);
                                        }
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === recipient.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{recipient.label}</span>
                                        <span className="text-xs text-gray-500">{recipient.description}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
} 