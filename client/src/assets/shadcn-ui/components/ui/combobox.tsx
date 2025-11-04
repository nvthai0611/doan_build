import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  allowCustom?: boolean
  onAddCustom?: (label: string, description?: string) => void
  customDialogTitle?: string
  customDialogDescription?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  // placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không tìm thấy kết quả.",
  className,
  disabled = false,
  allowCustom = false,
  onAddCustom,
  customDialogTitle = "Thêm mới",
  customDialogDescription = "Nhập thông tin chi tiết",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [customLabel, setCustomLabel] = React.useState("")
  const [customDescription, setCustomDescription] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue)
    setOpen(false)
    setSearchValue("")
  }

  const handleCustomValue = () => {
    if (allowCustom && onAddCustom) {
      setCustomLabel(searchValue.trim())
      setCustomDescription("")
      setDialogOpen(true)
    } else if (searchValue.trim()) {
      onValueChange?.(searchValue.trim())
      setOpen(false)
      setSearchValue("")
    }
  }

  const handleAddCustom = () => {
    if (customLabel.trim() && onAddCustom) {
      onAddCustom(customLabel.trim(), customDescription.trim() || undefined)
      onValueChange?.(customLabel.trim())
      setDialogOpen(false)
      setOpen(false)
      setSearchValue("")
      setCustomLabel("")
      setCustomDescription("")
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedOption && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <div className="flex flex-col items-start text-left">
              {selectedOption ? (
                <>
                  <span className="font-medium">{selectedOption.label}</span>
                  {selectedOption.description && (
                    <span className="text-xs text-muted-foreground">{selectedOption.description}</span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Chọn</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      value === option.value && "bg-accent"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {emptyText}
                </div>
              )}
               {allowCustom && searchValue.trim() && !filteredOptions.some(option => option.label.toLowerCase() === searchValue.toLowerCase()) && (
                 <div
                   className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground border-t mt-1"
                   onClick={handleCustomValue}
                 >
                   <span className="mr-2 text-muted-foreground">+</span>
                   {allowCustom ? `Thêm "${searchValue}"` : `Chọn "${searchValue}"`}
                 </div>
               )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{customDialogTitle}</DialogTitle>
            <DialogDescription>
              {customDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-label" className="text-right">
                Tên
              </Label>
              <Input
                id="custom-label"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="col-span-3"
                placeholder="Nhập tên trường học"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-description" className="text-right">
                Địa chỉ
              </Label>
              <Input
                id="custom-description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="col-span-3"
                placeholder="Nhập địa chỉ trường học"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddCustom} disabled={!customLabel.trim()}>
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
