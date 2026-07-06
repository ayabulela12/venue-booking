"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, Trash2, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  type?: 'delete' | 'revoke' | 'warning'
  onConfirm: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-6 w-6 text-destructive" />
      case 'revoke':
        return <Ban className="h-6 w-6 text-orange-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'delete':
        return "destructive" as const
      case 'revoke':
        return "destructive" as const
      default:
        return "default" as const
    }
  }

  const accentClass =
    type === "delete"
      ? "border-destructive/20 bg-destructive/5"
      : type === "revoke"
        ? "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/30"
        : "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/30"

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-0 bg-transparent p-0 shadow-none sm:max-w-[440px]">
        <Card className="gap-0 overflow-hidden py-0 shadow-lg">
          <CardHeader className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                  accentClass
                )}
              >
                {getIcon()}
              </div>
              <div className="space-y-1.5 pt-0.5">
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="text-left text-sm leading-relaxed">
                  {description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardFooter className="flex justify-end gap-2 border-t bg-muted/30 px-6 py-4">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Please wait…" : confirmText}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
