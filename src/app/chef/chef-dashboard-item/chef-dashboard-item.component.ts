import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {Router} from '@angular/router';
import { LucideAngularModule, Plus, X, Upload, DollarSign, Package, ChefHat, Sparkles, Scale, Ruler } from 'lucide-angular';
import { ItemChef } from '../../services/chef/item-chef';
import { ItemCreateUpdateDto, ItemDto, ItemSizeType, ItemSizeEnum, AddOn } from '../../models/AddItemChef';
import { Category } from '../../admin/models/categoryModel';
import { CategoryService } from '../../admin/services/category';
import {RestaurantService} from '../../services/chef/restaurant.service';
import { AddOnService } from '../../services/chef/addon.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chef-dashboard-item',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './chef-dashboard-item.component.html',
  styleUrl: './chef-dashboard-item.component.css'
})
export class ChefDashboardItemComponent implements OnInit {
  // Lucide icons
  readonly Plus = Plus;
  readonly X = X;
  readonly Upload = Upload;
  readonly DollarSign = DollarSign;
  readonly Package = Package;
  readonly ChefHat = ChefHat;
  readonly Sparkles = Sparkles;
  readonly Scale = Scale;
  readonly Ruler = Ruler;

  // Enums for template access
  readonly ItemSizeType = ItemSizeType;
  readonly ItemSizeEnum = ItemSizeEnum;

  itemForm!: FormGroup;
  isSubmitting = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  public categories?: Category[];
  validationErrors: string[] = [];
  isLoadingRestaurant = false;
  restaurant: any = null;
  isLoading = false;
  existingAddOns: AddOn[] = [];
  showExistingAddOns = false;
  editMode = false;
  itemData : ItemDto | null = null;

  // Size type options for UI
  sizeTypeOptions = [
    { value: ItemSizeType.Fixed, label: 'Fixed Price', description: 'Single price for all items (e.g., Sandwich, Salad)', icon: 'Package' },
    { value: ItemSizeType.Sized, label: 'Multiple Sizes', description: 'Different sizes with different prices (e.g., Pizza: S/M/L)', icon: 'Ruler' },
    { value: ItemSizeType.Weighted, label: 'Sold by Weight', description: 'Price per kilogram (e.g., Grilled meats, Kebab)', icon: 'Scale' }
  ];

  // Size options for sized items
  sizeOptions = [
    { value: ItemSizeEnum.Small, label: 'Small', shortLabel: 'S' },
    { value: ItemSizeEnum.Medium, label: 'Medium', shortLabel: 'M' },
    { value: ItemSizeEnum.Large, label: 'Large', shortLabel: 'L' }
  ];

  constructor(
    private fb: FormBuilder,
    private itemService: ItemChef,
    private categoryService: CategoryService,
    private restaurantService: RestaurantService,
    private addOnService: AddOnService,
    private http: HttpClient,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.itemData = navigation.extras.state['itemData'];
      this.editMode = navigation.extras.state['mode'] === 'edit';
    }
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCategories();
    this.loadChefRestaurant();
    this.loadExistingAddOns();
    if (this.editMode && this.itemData) {
      this.populateFormForEdit(this.itemData);
    }
  }

  private populateFormForEdit(item: ItemDto) {
    this.itemForm.patchValue({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      restaurantId: item.restaurantId,
      sizeType: item.sizeType,
      size: item.size || ItemSizeEnum.Medium, // Default to Medium if not set
      weight: item.weight || 1 // Default weight to 1 kg if not set
    });

    // Populate size pricing for sized items
    if (item.sizeType === ItemSizeType.Sized && item.sizePricing) {
      this.sizePricing.clear();
      item.sizePricing.forEach(sp => {
        this.sizePricing.push(this.fb.group({
          size: [sp.size, Validators.required],
          price: [sp.price, [Validators.required, Validators.min(0.01)]],
          label: [sp.label || '']
        }));
      });
    }

    // Populate add-ons
    if (item.addOns) {
      this.addOns.clear();
      item.addOns.forEach(addOn => {
        this.addOns.push(this.fb.group({
          name: [addOn.name, Validators.required],
          additionalPrice: [addOn.additionalPrice, [Validators.required, Validators.min(0)]]
        }));
      });
    }

    // Populate combos
    if (item.combos) {
      this.combos.clear();
      item.combos.forEach(combo => {
        this.combos.push(this.fb.group({
          name: [combo.name, Validators.required],
          comboPrice: [combo.comboPrice, [Validators.required, Validators.min(0)]]
        }));
      });
    }

    // Set image preview if available
    if (item.imageUrl) {
      this.imagePreview = item.imageUrl;
    }
  }

  private loadChefRestaurant() {
    this.isLoadingRestaurant = true;

    this.restaurantService.getChefRestaurant().subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        // Update the form with the restaurant ID
        if (restaurant && restaurant.id) {
          this.itemForm.patchValue({
            restaurantId: restaurant.id
          });
        }
        this.isLoadingRestaurant = false;
      },
      error: (error) => {
        console.error('Error loading restaurant:', error);
        this.isLoadingRestaurant = false;
        // Handle case where chef doesn't have a restaurant yet
        if (error.status === 404) {
          // Show message or redirect to create restaurant page
        }
      }
    });
  }

  loadExistingAddOns() {
    this.addOnService.getChefAddOns().subscribe({
      next: (addOns: AddOn[]) => {
        this.existingAddOns = addOns;
      },
      error: (error) => {
        console.error('Error loading existing addons:', error);
      }
    });
  }
  private initializeForm() {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      restaurantId: ['', Validators.required],
      sizeType: [ItemSizeType.Fixed, Validators.required],
      size: [ItemSizeEnum.Medium], // Default size for sized items
      weight: [1, [Validators.min(0.1)]], // Default weight in kg
      sizePricing: this.fb.array([]),
      addOns: this.fb.array([]),
      combos: this.fb.array([])
    });

    // Watch for size type changes
    this.itemForm.get('sizeType')?.valueChanges.subscribe(sizeType => {
      this.onSizeTypeChange(sizeType);
    });
  }

  get sizePricing(): FormArray {
    return this.itemForm.get('sizePricing') as FormArray;
  }

  get addOns(): FormArray {
    return this.itemForm.get('addOns') as FormArray;
  }

  get combos(): FormArray {
    return this.itemForm.get('combos') as FormArray;
  }

  get selectedSizeType(): ItemSizeType {
    return this.itemForm.get('sizeType')?.value || ItemSizeType.Fixed;
  }

  private loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onSizeTypeChange(sizeType: ItemSizeType) {
    // Clear existing size pricing
    this.sizePricing.clear();

    // Reset form validators based on size type
    const priceControl = this.itemForm.get('price');
    const weightControl = this.itemForm.get('weight');

    switch (sizeType) {
      case ItemSizeType.Fixed:
        priceControl?.setValidators([Validators.required, Validators.min(0.01)]);
        weightControl?.clearValidators();
        break;

      case ItemSizeType.Sized:
        priceControl?.clearValidators();
        weightControl?.clearValidators();
        this.initializeSizePricing();
        break;

      case ItemSizeType.Weighted:
        priceControl?.setValidators([Validators.required, Validators.min(0.01)]);
        weightControl?.setValidators([Validators.required, Validators.min(0.1)]);
        break;
    }

    priceControl?.updateValueAndValidity();
    weightControl?.updateValueAndValidity();
  }

  private initializeSizePricing() {
    // ✅ Add default size pricing with placeholder prices
    this.sizeOptions.forEach(sizeOption => {
      const sizePricingGroup = this.fb.group({
        size: [sizeOption.value, Validators.required],
        price: ['', [Validators.required, Validators.min(0.01)]], // ✅ Ensure minimum price
        label: [sizeOption.label]
      });
      this.sizePricing.push(sizePricingGroup);
    });
  }

  addSizePrice() {
    const sizePricingGroup = this.fb.group({
      size: [ItemSizeEnum.Small, Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      label: ['']
    });
    this.sizePricing.push(sizePricingGroup);
  }

  removeSizePrice(index: number) {
    this.sizePricing.removeAt(index);
  }

  getSizeLabel(sizeValue: ItemSizeEnum): string {
    const sizeOption = this.sizeOptions.find(option => option.value === sizeValue);
    return sizeOption ? sizeOption.label : 'Unknown';
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addAddOn() {
    const addOnGroup = this.fb.group({
      name: ['', Validators.required],
      additionalPrice: ['', [Validators.required, Validators.min(0)]],
      // imageUrl: ['']
    });
    this.addOns.push(addOnGroup);
  }

  removeAddOn(index: number) {
    this.addOns.removeAt(index);
  }

  addCombo() {
    const comboGroup = this.fb.group({
      name: ['', Validators.required],
      comboPrice: ['', [Validators.required, Validators.min(0)]],
      // items: this.fb.array([]),// Array to hold combo items,
      // imageUrl: ['']
    });
    this.combos.push(comboGroup);
  }

  removeCombo(index: number) {
    this.combos.removeAt(index);
  }

  // onSubmit() {
  //   if (this.itemForm.valid && !this.isSubmitting) {
  //     this.isSubmitting = true;
  //     this.validationErrors = [];
  //
  //     // Calculate base price based on size type
  //     let basePrice = 0;
  //
  //     if (this.selectedSizeType === ItemSizeType.Fixed) {
  //       basePrice = parseFloat(this.itemForm.get('price')?.value || '0');
  //     } else if (this.selectedSizeType === ItemSizeType.Sized) {
  //       const sizePricing = this.itemForm.get('sizePricing')?.value || [];
  //       const validPrices = sizePricing
  //         .filter((sp: any) => sp.price && parseFloat(sp.price) > 0)
  //         .map((sp: any) => parseFloat(sp.price));
  //       basePrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  //     } else if (this.selectedSizeType === ItemSizeType.Weighted) {
  //       basePrice = parseFloat(this.itemForm.get('price')?.value || '0');
  //     }
  //
  //     const itemDto: ItemCreateUpdateDto = {
  //       name: this.itemForm.get('name')?.value,
  //       description: this.itemForm.get('description')?.value,
  //       categoryId: parseInt(this.itemForm.get('categoryId')?.value),
  //       restaurantId: this.restaurant?.id || 0,
  //       sizeType: this.itemForm.get('sizeType')?.value,
  //       price: basePrice,
  //       imageUrl: this.imagePreview || undefined, // Use Base64 image
  //
  //       ...(this.selectedSizeType === ItemSizeType.Weighted && {
  //         weight: parseFloat(this.itemForm.get('weight')?.value)
  //       }),
  //
  //       ...(this.selectedSizeType === ItemSizeType.Sized && {
  //         sizePricing: this.itemForm.get('sizePricing')?.value
  //           .filter((sp: any) => sp.size !== null && sp.price && parseFloat(sp.price) > 0)
  //           .map((sp: any) => ({
  //             size: parseInt(sp.size),
  //             price: parseFloat(sp.price)
  //           }))
  //       }),
  //
  //       addOns: this.itemForm.get('addOns')?.value
  //         .filter((addOn: any) => addOn.name && addOn.additionalPrice)
  //         .map((addOn: any) => ({
  //           name: addOn.name,
  //           additionalPrice: parseFloat(addOn.additionalPrice)
  //         })) || [],
  //
  //       combos: this.itemForm.get('combos')?.value
  //         .filter((combo: any) => combo.name && combo.comboPrice)
  //         .map((combo: any) => ({
  //           name: combo.name,
  //           comboPrice: parseFloat(combo.comboPrice)
  //         })) || []
  //     };
  //
  //     console.log('📤 Sending item data:', itemDto);
  //     this.addItemWithoutImage(itemDto);
  //   }
  // }
  onSubmit() {
    if (this.itemForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.validationErrors = [];

      // Calculate base price based on size type
      let basePrice = 0;

      if (this.selectedSizeType === ItemSizeType.Fixed) {
        basePrice = parseFloat(this.itemForm.get('price')?.value || '0');
      } else if (this.selectedSizeType === ItemSizeType.Sized) {
        const sizePricing = this.itemForm.get('sizePricing')?.value || [];
        const validPrices = sizePricing
          .filter((sp: any) => sp.price && parseFloat(sp.price) > 0)
          .map((sp: any) => parseFloat(sp.price));
        basePrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
      } else if (this.selectedSizeType === ItemSizeType.Weighted) {
        basePrice = parseFloat(this.itemForm.get('price')?.value || '0');
      }

      const itemDto: ItemCreateUpdateDto = {
        // ✅ Add id for update operations
        ...(this.editMode && this.itemData && { id: this.itemData.id }),

        name: this.itemForm.get('name')?.value,
        description: this.itemForm.get('description')?.value,
        categoryId: parseInt(this.itemForm.get('categoryId')?.value),
        restaurantId: this.restaurant?.id || 0,
        sizeType: this.itemForm.get('sizeType')?.value,
        price: basePrice,
        imageUrl: this.imagePreview || undefined,

        ...(this.selectedSizeType === ItemSizeType.Weighted && {
          weight: parseFloat(this.itemForm.get('weight')?.value)
        }),

        ...(this.selectedSizeType === ItemSizeType.Sized && {
          sizePricing: this.itemForm.get('sizePricing')?.value
            .filter((sp: any) => sp.size !== null && sp.price && parseFloat(sp.price) > 0)
            .map((sp: any) => ({
              size: parseInt(sp.size),
              price: parseFloat(sp.price)
            }))
        }),

        addOns: this.itemForm.get('addOns')?.value
          .filter((addOn: any) => addOn.name && addOn.additionalPrice)
          .map((addOn: any) => ({
            name: addOn.name,
            additionalPrice: parseFloat(addOn.additionalPrice)
          })) || [],

        combos: this.itemForm.get('combos')?.value
          .filter((combo: any) => combo.name && combo.comboPrice)
          .map((combo: any) => ({
            name: combo.name,
            comboPrice: parseFloat(combo.comboPrice)
          })) || []
      };

      console.log('📤 Sending item data:', itemDto);

      // ✅ Choose between add and update based on edit mode
      if (this.editMode && this.itemData) {
        this.updateItemWithoutImage(itemDto);
      } else {
        this.addItemWithoutImage(itemDto);
      }
    }
  }

  private updateItemWithoutImage(itemDto: ItemCreateUpdateDto) {
    this.itemService.updateItem(itemDto).subscribe({
      next: (response) => {
        console.log('✅ Item updated successfully:', response);
        this.isSubmitting = false;
        // Navigate back to menu or show success message
        this.router.navigate(['/chef/chef-dashboard-menu']);
      },
      error: (error) => {
        console.error('❌ Error updating item:', error);
        this.isSubmitting = false;

        if (error.error?.message) {
          this.validationErrors = [error.error.message];
        } else if (error.error?.errors) {
          this.validationErrors = Object.values(error.error.errors).flat() as string[];
        } else {
          this.validationErrors = ['Failed to update item. Please try again.'];
        }
      }
    });
  }

  private addItemWithoutImage(itemDto: ItemCreateUpdateDto) {
    this.itemService.addItem(itemDto).subscribe({
      next: (response) => {
        console.log('✅ Item added successfully:', response);
        this.isSubmitting = false;
        this.resetForm();
      },
      error: (error) => {
        console.error('❌ Error adding item:', error);
        this.isSubmitting = false;

        if (error.error?.message) {
          this.validationErrors = [error.error.message];
        } else if (error.error?.errors) {
          this.validationErrors = Object.values(error.error.errors).flat() as string[];
        } else {
          this.validationErrors = ['Failed to add item. Please try again.'];
        }
      }
    });
  }

  private uploadImageThenAddItem(itemDto: ItemCreateUpdateDto) {
    const formData = new FormData();
    formData.append('image', this.selectedImage!);

    this.http.post<any>('https://localhost:7045/api/Images/upload', formData)
      .subscribe({
        next: (response: any) => {
          console.log('Image upload response:', response);

          // Handle different response formats
          if (response.imageUrl) {
            itemDto.imageUrl = response.imageUrl;
          } else if (response.url) {
            itemDto.imageUrl = response.url;
          } else if (typeof response === 'string') {
            itemDto.imageUrl = response;
          }

          this.addItemWithoutImage(itemDto);
        },
        error: (error: any) => {
          console.error('Error uploading image:', error);
          // Add item without image as fallback
          this.addItemWithoutImage(itemDto);
        }
      });
  }
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  public resetForm() {
    this.itemForm.reset();
    this.selectedImage = null;
    this.imagePreview = null;
    this.validationErrors = [];
    this.addOns.clear();
    this.combos.clear();
    this.sizePricing.clear();
    this.initializeForm();
  }

  getCategoryName(categoryId: number | string): string {
    const id = Number(categoryId);
    const category = this.categories?.find(cat => cat.id === id);
    return category ? category.name : 'Unknown Category';
  }

  // Helper method to get pricing display for different size types
  getPricingDisplay(): string {
    const sizeType = this.selectedSizeType;
    const formValue = this.itemForm.value;

    switch (sizeType) {
      case ItemSizeType.Fixed:
        return formValue.price ? `$${parseFloat(formValue.price).toFixed(2)}` : 'Set price';

      case ItemSizeType.Sized:
        const sizePrices = formValue.sizePricing?.filter((sp: any) => sp.price);
        if (sizePrices?.length > 0) {
          const minPrice = Math.min(...sizePrices.map((sp: any) => parseFloat(sp.price)));
          const maxPrice = Math.max(...sizePrices.map((sp: any) => parseFloat(sp.price)));
          return minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
        }
        return 'Set size prices';

      case ItemSizeType.Weighted:
        const pricePerKg = formValue.price;
        const weight = formValue.weight;
        if (pricePerKg && weight) {
          return `$${parseFloat(pricePerKg).toFixed(2)}/kg (${weight}kg = $${(parseFloat(pricePerKg) * parseFloat(weight)).toFixed(2)})`;
        }
        return 'Set price per kg';

      default:
        return '';
    }
  }
  toggleAddOnSelection() {
    this.showExistingAddOns = !this.showExistingAddOns;
  }

  selectExistingAddOn(addOn: AddOn) {
    // Add existing AddOn to form
    const addOnControl = this.fb.group({
      name: [addOn.name, Validators.required],
      additionalPrice: [addOn.additionalPrice, [Validators.required, Validators.min(0)]]
    });

    this.addOns.push(addOnControl);
  }
}
