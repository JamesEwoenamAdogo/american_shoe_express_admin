import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";

const AddItem = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [itemNumber, setItemNumber] = useState("");
  const [gender, setGender] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [cost, setCost] = useState(0);
  const [retailCost, setRetailCost] = useState(0);
  const [size, setSize] = useState("");
  const [americanSize, setAmericanSize] = useState("");
  const [GhanaSize, setGhanaSize] = useState("");
  const [shoeStatus, setShoeStatus] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const { toast } = useToast();

  const genderOptions = ["Men", "Womens", "Unisex", "Children", "Teen"];
  const shoeStatusOptions = ["Brand New", "Slightly Used", "Used"];
  const typeOptions = ["Sneakers", "Dress", "Boots", "Sandals", "Sliders"];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      const imagePromises = fileArray.map((file) => {
        return new Promise<{ file: File; preview: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve({ file, preview: result });
          };
          reader.readAsDataURL(file);
        });
      });
      
      const newImages = await Promise.all(imagePromises);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Revoke object URLs to prevent memory leaks
      return updated;
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const toggleGender = (genderValue: string) => {
    setGender((prev) =>
      prev.includes(genderValue)
        ? prev.filter((g) => g !== genderValue)
        : [...prev, genderValue]
    );
  };

  const toggleShoeStatus = (status: string) => {
    setShoeStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('itemNumber', itemNumber);
      formData.append('Gender', JSON.stringify(gender));
      formData.append('quantity', String(quantity));
      formData.append('cost', String(cost));
      formData.append('retailCost', String(retailCost));
      formData.append('size', size);
      formData.append('AmericanSize', americanSize);
      formData.append('GhanaianSize', GhanaSize);
      formData.append('shoeStatus', JSON.stringify(shoeStatus));
      formData.append('type', JSON.stringify(selectedTypes));
      images.forEach((img, index) => {
        formData.append(`images`, img.file);
      });

      const response = await axiosInstance.post('/add-shoe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Item has been added to your inventory.",
        });

        setName("");
        setDescription("");
        setItemNumber("");
        setGender([]);
        setQuantity(0);
        setCost(0);
        setRetailCost(0);
        setSize("");
        setAmericanSize("");
        setGhanaSize("");
        setShoeStatus([]);
        setSelectedTypes([]);
        setImages([]);
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to add item.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Add New Item</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-8">Add a new shoe to your inventory</p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Add New Shoe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Shoe</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new shoe item. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Air Max 90"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the shoe..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="itemNumber">Item Number</Label>
                  <Input
                    id="itemNumber"
                    value={itemNumber}
                    onChange={(e) => setItemNumber(e.target.value)}
                    placeholder="e.g., SKU-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity Available</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder="e.g., 50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Cost (₵)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 99.99"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="retailCost">Retail Cost (₵)</Label>
                  <Input
                    id="retailCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={retailCost}
                    onChange={(e) => setRetailCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 149.99"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="size">American Size</Label>
                  <Input
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g., 9, 10, M, L, etc."
                    required
                  />
                </div>
               
                <div className="grid gap-2">
                  <Label htmlFor="GhanaSize">Ghana Size</Label>
                  <Input
                    id="GhanaSize"
                    value={GhanaSize}
                    onChange={(e) => setGhanaSize(e.target.value)}
                    placeholder="e.g., 42, 43, etc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Shoe Status</Label>
                  <div className="space-y-2">
                    {shoeStatusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={shoeStatus.includes(status)}
                          onChange={() => toggleShoeStatus(status)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`status-${status}`} className="font-normal cursor-pointer">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <div className="space-y-2">
                    {typeOptions.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <div className="space-y-2">
                    {genderOptions.map((genderValue) => (
                      <div key={genderValue} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`gender-${genderValue}`}
                          checked={gender.includes(genderValue)}
                          onChange={() => toggleGender(genderValue)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`gender-${genderValue}`} className="font-normal cursor-pointer">
                          {genderValue}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Images</Label>
                  <div className="flex flex-col gap-4">
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden border border-border"
                          >
                            <img
                              src={img.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label htmlFor="image" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload shoe images
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP up to 10MB each (multiple allowed)
                        </span>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Item</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AddItem;
