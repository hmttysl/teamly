"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConfirmDialogProps {
  children: React.ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  variant?: "danger" | "warning";
  requireConfirmText?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  children,
  title,
  description,
  confirmText,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  variant = "danger",
  requireConfirmText = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
    setInputValue("");
  };

  const isConfirmDisabled = requireConfirmText && inputValue !== confirmText;

  const variantStyles = {
    danger: {
      icon: "bg-red-100 text-red-600",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: "bg-amber-100 text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${styles.icon}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription className="mt-2">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {requireConfirmText && confirmText && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Type <span className="font-semibold text-gray-900">{confirmText}</span> to confirm:
              </p>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={confirmText}
                className="font-mono"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                setInputValue("");
              }}
            >
              {cancelButtonText}
            </Button>
            <Button
              className={`flex-1 ${styles.button}`}
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
            >
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



