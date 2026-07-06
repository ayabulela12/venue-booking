"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { uploadVenueImage } from "@/lib/supabase-services"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import { VENUE_TYPES } from "@/lib/constants"
import type { Venue, VenueType } from "@/lib/types"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Basic Info", "Owner & Location", "Details", "Media & Review"]

const venueSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["indoor", "outdoor", "hybrid"]),
  maxPopulation: z.coerce.number().min(1, "Must be at least 1"),
  ownerName: z.string().min(2, "Owner name required"),
  ownerContact: z.string().min(2, "Contact information required"),
  address: z.string().min(5, "Address required"),
  aboutVenue: z.string().optional(),
  featuresText: z.string().optional(),
  activitiesText: z.string().optional(),
})

type VenueFormData = z.infer<typeof venueSchema>

function parseLinesToList(text?: string) {
  return (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
}

interface VenueFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venue?: Venue
}

export function VenueFormDialog({ open, onOpenChange, venue }: VenueFormProps) {
  const { addVenue, updateVenue } = useStore()
  const isEditing = !!venue
  const [step, setStep] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: venue
      ? {
          name: venue.name,
          type: venue.type,
          maxPopulation: venue.maxPopulation,
          ownerName: venue.ownerName,
          ownerContact: venue.ownerContact,
          address: venue.address,
          aboutVenue: venue.aboutVenue || "",
          featuresText: (venue.features || []).join("\n"),
          activitiesText: (venue.activities || []).join("\n"),
        }
      : {
          name: "",
          type: "indoor",
          maxPopulation: 100,
          ownerName: "",
          ownerContact: "",
          address: "",
          aboutVenue: "",
          featuresText: "",
          activitiesText: "",
        },
  })

  const selectedType = watch("type")
  const formData = watch()

  useEffect(() => {
    if (!open) {
      setImageFile(null)
      setStep(0)
    }
  }, [open])

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return formData.name.length >= 2 && formData.type && formData.maxPopulation >= 1
      case 1:
        return formData.ownerName.length >= 2 && formData.ownerContact.length >= 2 && formData.address.length >= 5
      case 2:
        return true // Details step has no required fields
      case 3:
        return true // Review step
      default:
        return false
    }
  }

  function resetForm() {
    reset()
    setImageFile(null)
    setStep(0)
  }

  async function onSubmit(data: VenueFormData) {
    setIsSubmitting(true)
    try {
    let imageUrl = venue?.image
    const aboutVenue = data.aboutVenue?.trim() ? data.aboutVenue.trim() : undefined
    const features = parseLinesToList(data.featuresText)
    const activities = parseLinesToList(data.activitiesText)

    if (imageFile) {
      try {
        imageUrl = await uploadVenueImage(imageFile)
      } catch (uploadError) {
        console.error("Venue image upload error:", uploadError)
        const message =
          uploadError instanceof Error ? uploadError.message : "Image upload failed"

        if (message.includes("too large") || message.includes("size")) {
          toast.error("Image file too large. Please use a smaller image (max 5MB).")
          setIsSubmitting(false)
          return
        }

        toast.error(`${message} Continuing without image.`, { duration: 6000 })
      }
    }

    if (isEditing && venue) {
      const updated: Venue = {
        ...venue,
        name: data.name,
        type: data.type as VenueType,
        maxPopulation: data.maxPopulation,
        ownerName: data.ownerName,
        ownerContact: data.ownerContact,
        address: data.address,
        aboutVenue,
        features,
        activities,
        image: imageUrl,
      }
      
      try {
        await updateVenue(updated)
        toast.success("Venue updated successfully")
      } catch (venueError: any) {
        console.error("Error updating venue:", venueError)
        
        // Better error handling for venue update
        if (venueError?.message) {
          toast.error(`Failed to update venue: ${venueError.message}`)
        } else if (venueError?.code) {
          toast.error(`Failed to update venue: ${venueError.code}`)
        } else {
          toast.error("Failed to update venue. Please check your connection and try again.")
        }
        
        return
      }
    } else {
      const newVenue = {
        name: data.name,
        type: data.type as VenueType,
        maxPopulation: data.maxPopulation,
        ownerName: data.ownerName,
        ownerContact: data.ownerContact,
        address: data.address,
        aboutVenue,
        features,
        activities,
        createdAt: new Date().toISOString(),
        image: imageUrl,
      }

      try {
        await addVenue(newVenue)
        toast.success("Venue added successfully")
      } catch (venueError: any) {
        console.error("Error creating venue:", venueError)
        
        // Better error handling for venue creation
        if (venueError?.message) {
          if (venueError.message.includes('Database permissions not configured')) {
            toast.error("Database permissions not configured. Please contact administrator to set up RLS policies for venues table.", {
              duration: 8000
            })
          } else if (venueError.message.includes('Row Level Security policy violation')) {
            toast.error("Database security policies not configured. Please contact administrator to set up proper access policies.", {
              duration: 8000
            })
          } else if (venueError.message.includes('permission denied')) {
            toast.error("Access denied. Please contact administrator to configure database permissions.", {
              duration: 8000
            })
          } else {
            toast.error(`Failed to create venue: ${venueError.message}`)
          }
        } else if (venueError?.code) {
          toast.error(`Failed to create venue: ${venueError.code}`)
        } else {
          toast.error("Failed to create venue. Please check your connection and try again.")
        }
        
        return
      }
    }
    resetForm()
    onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Venue" : "Add New Venue"}</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress steps */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Venue Name</Label>
                <Input id="name" {...register("name")} placeholder="Cape Town Stadium" />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Type</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(val) => setValue("type", val as VenueType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VENUE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="maxPopulation">Max Capacity</Label>
                  <Input
                    id="maxPopulation"
                    type="number"
                    {...register("maxPopulation")}
                  />
                  {errors.maxPopulation && (
                    <p className="text-xs text-destructive">
                      {errors.maxPopulation.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Owner & Location */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input id="ownerName" {...register("ownerName")} placeholder="City of Cape Town" />
                {errors.ownerName && (
                  <p className="text-xs text-destructive">
                    {errors.ownerName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ownerContact">Contact Info</Label>
                <Input
                  id="ownerContact"
                  {...register("ownerContact")}
                  placeholder="events@capetown.gov.za"
                />
                {errors.ownerContact && (
                  <p className="text-xs text-destructive">
                    {errors.ownerContact.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Fritz Sonnenberg Road, Green Point, Cape Town"
                />
                {errors.address && (
                  <p className="text-xs text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="aboutVenue">About / What it&apos;s used for</Label>
                <Textarea
                  id="aboutVenue"
                  {...register("aboutVenue")}
                  placeholder="E.g., Ideal for outdoor corporate events, community activities, and family gatherings."
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="featuresText">Features (one per line)</Label>
                <Textarea
                  id="featuresText"
                  {...register("featuresText")}
                  placeholder={"Stage\nSeating\nCatering access"}
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="activitiesText">Activities (one per line)</Label>
                <Textarea
                  id="activitiesText"
                  {...register("activitiesText")}
                  placeholder={"Concerts\nSports\nTrade shows"}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Media & Review */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="venueImage">Venue Image</Label>
                <Input
                  id="venueImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setImageFile(file)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {imageFile
                    ? `Selected: ${imageFile.name}`
                    : isEditing
                      ? "Leave empty to keep current image."
                      : "Optional: upload an image."}
                </p>
              </div>

              {/* Review Section */}
              <div className="rounded-md border p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                <h4 className="text-sm font-medium sticky top-0 bg-background pb-2">Venue Summary</h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium block">Name:</span>
                    <p className="text-muted-foreground break-words">{formData.name || "Not set"}</p>
                  </div>
                  <div>
                    <span className="font-medium block">Type:</span>
                    <p className="text-muted-foreground capitalize">{formData.type || "Not set"}</p>
                  </div>
                  <div>
                    <span className="font-medium block">Capacity:</span>
                    <p className="text-muted-foreground">{formData.maxPopulation?.toLocaleString() || "Not set"}</p>
                  </div>
                  <div>
                    <span className="font-medium block">Owner:</span>
                    <p className="text-muted-foreground break-words">{formData.ownerName || "Not set"}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-sm block">Address:</span>
                  <p className="text-sm text-muted-foreground break-words">{formData.address || "Not set"}</p>
                </div>
                
                {formData.aboutVenue && (
                  <div>
                    <span className="font-medium text-sm block">About:</span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{formData.aboutVenue}</p>
                  </div>
                )}
                
                {formData.featuresText && (
                  <div>
                    <span className="font-medium text-sm block">Features:</span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{formData.featuresText}</p>
                  </div>
                )}
                
                {formData.activitiesText && (
                  <div>
                    <span className="font-medium text-sm block">Activities:</span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{formData.activitiesText}</p>
                  </div>
                )}
                
                {imageFile && (
                  <div>
                    <span className="font-medium text-sm block">Image:</span>
                    <p className="text-sm text-muted-foreground break-words">{imageFile.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  disabled={!canProceed()}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    onOpenChange(false)
                  }}
                >
                  Cancel
                </Button>
              )}
              {step === STEPS.length - 1 && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving…"
                    : isEditing
                      ? "Update Venue"
                      : "Add Venue"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
