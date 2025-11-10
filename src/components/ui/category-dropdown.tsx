"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryTreeDto } from "@/types/category";
import { useLanguage } from "@/providers/languageProvider";

export interface CategoryNode {
  id: string;
  name: string;
  slug?: string;
  children?: CategoryNode[];
  level: number;
}

interface CategoryDropdownProps {
  selectedCategoryId?: string | null;
  onCategorySelect: (categoryId: string, categoryPath?: string) => void;
  className?: string;
  autoLoad?: boolean;
  categories?: CategoryTreeDto[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  compactMode?: boolean;
}

// Convert CategoryTreeDto to CategoryNode
const convertToCategoryNode = (dto: CategoryTreeDto, level: number = 0): CategoryNode => {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    level,
    children: dto.children?.map(child => convertToCategoryNode(child, level + 1))
  };
};

// Translate category name based on slug
const getCategoryName = (category: CategoryNode, t: (key: string) => string): string => {
  if (category.slug) {
    const translationKey = `ui.category.names.${category.slug}`;
    const translated = t(translationKey);
    // If translation exists and is different from the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
  }
  // Fallback to original name if no translation found
  return category.name;
};

export default function CategoryDropdown({
  selectedCategoryId,
  onCategorySelect,
  className,
  autoLoad = true,
  categories: externalCategories,
  isLoading: externalIsLoading,
  error: externalError,
  onRetry,
  compactMode = false
}: CategoryDropdownProps) {
  const { t } = useLanguage();
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

 
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  const error = externalError !== undefined ? externalError : internalError;
  
  // Selected values for each level
  const [selectedLevels, setSelectedLevels] = useState<{
    level1?: string;
    level2?: string;
    level3?: string;
  }>({});

  
  // Available options for each level
  const [availableOptions, setAvailableOptions] = useState<{
    level1: CategoryNode[];
    level2: CategoryNode[];
    level3: CategoryNode[];
  }>({
    level1: [],
    level2: [],
    level3: []
  });

  // Load categories from API (only if external data not provided)
  const loadCategories = useCallback(async () => {
    if (!autoLoad || externalCategories) return;
    
    setInternalIsLoading(true);
    setInternalError(null);
    
    try {
      const response = await fetch('/api/category?isTree=true');
      const data = await response.json();
      
      if (data.success && data.data) {
        const categoryNodes = data.data.map((dto: CategoryTreeDto) => convertToCategoryNode(dto));
        setAvailableOptions(prev => ({
          ...prev,
          level1: categoryNodes
        }));
      } else {
        setInternalError(data.message || 'Failed to load categories');
      }
    } catch (err) {
      setInternalError('Failed to load categories');
      console.error('CategoryDropdown load error:', err);
    } finally {
      setInternalIsLoading(false);
    }
  }, [autoLoad, externalCategories]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [autoLoad, loadCategories]);

  // Update available options when external categories change
  useEffect(() => {
    if (externalCategories && externalCategories.length > 0) {
      const categoryNodes = externalCategories.map((dto: CategoryTreeDto) => convertToCategoryNode(dto));
      setAvailableOptions(prev => ({
        ...prev,
        level1: categoryNodes
      }));
    }
  }, [externalCategories]);

  // Set initial selection based on selectedCategoryId
  useEffect(() => {
    // Reset selection if selectedCategoryId is null or empty
    if (!selectedCategoryId || selectedCategoryId === 'null' || selectedCategoryId === '' || selectedCategoryId === 'undefined') {
      setSelectedLevels({});
      setAvailableOptions(prev => ({
        ...prev,
        level2: [],
        level3: []
      }));
      return;
    }
    
    if (selectedCategoryId && availableOptions.level1.length > 0) {
      // Find the category in the tree and build the full path from root to target
      const findCategoryPath = (categories: CategoryNode[], targetId: string, path: string[] = []): string[] | null => {
        for (const category of categories) {
          const currentPath = [...path, category.id];
          
          if (category.id === targetId) {
            return currentPath;
          }
          
          if (category.children && category.children.length > 0) {
            const result = findCategoryPath(category.children, targetId, currentPath);
            if (result) {
              return result;
            }
          }
        }
        return null;
      };

      const categoryPath = findCategoryPath(availableOptions.level1, selectedCategoryId);
      

      
      if (categoryPath && categoryPath.length > 0) {
        // Set the selected levels based on the path
        const newSelectedLevels: { level1?: string; level2?: string; level3?: string } = {};
        
        if (categoryPath.length >= 1) {
          newSelectedLevels.level1 = categoryPath[0];
        }
        if (categoryPath.length >= 2) {
          newSelectedLevels.level2 = categoryPath[1];
        }
        if (categoryPath.length >= 3) {
          newSelectedLevels.level3 = categoryPath[2];
        }

        setSelectedLevels(newSelectedLevels);

        // Update available options based on the selection
        if (newSelectedLevels.level1) {
          const level1Category = availableOptions.level1.find(cat => cat.id === newSelectedLevels.level1);
          if (level1Category && level1Category.children) {
            setAvailableOptions(prev => ({
              ...prev,
              level2: level1Category.children || []
            }));

            if (newSelectedLevels.level2) {
              const level2Category = level1Category.children.find(cat => cat.id === newSelectedLevels.level2);
              if (level2Category && level2Category.children) {
                setAvailableOptions(prev => ({
                  ...prev,
                  level3: level2Category.children || []
                }));
              }
            }
          }
        }
      }
    }
  }, [selectedCategoryId, availableOptions.level1]);

  // Handle level 1 selection
  const handleLevel1Change = (value: string) => {
    const selectedCategory = availableOptions.level1.find(cat => cat.id === value);
    if (!selectedCategory) return;

    const newSelectedLevels = { level1: value, level2: undefined, level3: undefined };
    setSelectedLevels(newSelectedLevels);

    // Update level 2 options
    const level2Options = selectedCategory.children || [];
    setAvailableOptions(prev => ({
      ...prev,
      level2: level2Options,
      level3: []
    }));

    // If no children, select this category
    if (level2Options.length === 0) {
      const categoryPath = getCategoryName(selectedCategory, t);
      onCategorySelect(selectedCategory.id, categoryPath);
    }
  };

  // Handle level 2 selection
  const handleLevel2Change = (value: string) => {
    const selectedCategory = availableOptions.level2.find(cat => cat.id === value);
    if (!selectedCategory) return;

    const newSelectedLevels = { ...selectedLevels, level2: value, level3: undefined };
    setSelectedLevels(newSelectedLevels);

    // Update level 3 options
    const level3Options = selectedCategory.children || [];
    setAvailableOptions(prev => ({
      ...prev,
      level3: level3Options
    }));

    // If no children, select this category
    if (level3Options.length === 0) {
      const level1Category = availableOptions.level1.find(cat => cat.id === selectedLevels.level1);
      const level1Name = level1Category ? getCategoryName(level1Category, t) : '';
      const categoryPath = `${level1Name} > ${getCategoryName(selectedCategory, t)}`;
      onCategorySelect(selectedCategory.id, categoryPath);
    }
  };

  // Handle level 3 selection
  const handleLevel3Change = (value: string) => {
    const selectedCategory = availableOptions.level3.find(cat => cat.id === value);
    if (!selectedCategory) return;

    const newSelectedLevels = { ...selectedLevels, level3: value };
    setSelectedLevels(newSelectedLevels);

    // Select this category (level 3 is the final level)
    const level1Category = availableOptions.level1.find(cat => cat.id === selectedLevels.level1);
    const level2Category = availableOptions.level2.find(cat => cat.id === selectedLevels.level2);
    const level1Name = level1Category ? getCategoryName(level1Category, t) : '';
    const level2Name = level2Category ? getCategoryName(level2Category, t) : '';
    const categoryPath = `${level1Name} > ${level2Name} > ${getCategoryName(selectedCategory, t)}`;
    onCategorySelect(selectedCategory.id, categoryPath);
  };

  // Get selected category path for display
  const getSelectedPath = () => {
    if (!selectedLevels.level1) return '';

    const level1Category = availableOptions.level1.find(cat => cat.id === selectedLevels.level1);
    const level1Name = level1Category ? getCategoryName(level1Category, t) : '';
    let path = level1Name;

    if (selectedLevels.level2) {
      const level2Category = availableOptions.level2.find(cat => cat.id === selectedLevels.level2);
      const level2Name = level2Category ? getCategoryName(level2Category, t) : '';
      path += ` > ${level2Name}`;
    }

    if (selectedLevels.level3) {
      const level3Category = availableOptions.level3.find(cat => cat.id === selectedLevels.level3);
      const level3Name = level3Category ? getCategoryName(level3Category, t) : '';
      path += ` > ${level3Name}`;
    }

    return path;
  };

  if (isLoading) {
    return (
      <div className={`border rounded-lg bg-white p-4 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>{t("ui.category.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border rounded-lg bg-white p-4 ${className}`}>
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry || loadCategories}
            className="mt-2"
          >
            {t("ui.category.retry")}
          </Button>
        </div>
      </div>
    );
  }

  // Compact mode rendering
  if (compactMode) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Level 1 Dropdown */}
        <Select value={selectedLevels.level1 || ""} onValueChange={handleLevel1Change}>
          <SelectTrigger className="min-w-[150px]">
            <SelectValue placeholder={selectedCategoryId ? t("ui.category.categorySelected") : t("ui.category.mainCategory")} />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.level1.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {getCategoryName(category, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Arrow */}
        {selectedLevels.level1 && availableOptions.level2.length > 0 && (
          <>
            <span className="text-gray-400">→</span>
            {/* Level 2 Dropdown */}
            <Select value={selectedLevels.level2 || ""} onValueChange={handleLevel2Change}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder={t("ui.category.subCategory")} />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.level2.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryName(category, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {/* Arrow */}
        {selectedLevels.level2 && availableOptions.level3.length > 0 && (
          <>
            <span className="text-gray-400">→</span>
            {/* Level 3 Dropdown */}
            <Select value={selectedLevels.level3 || ""} onValueChange={handleLevel3Change}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder={t("ui.category.subSubCategory")} />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.level3.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryName(category, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    );
  }

  // Full mode rendering
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border rounded-lg bg-white p-4">
        <h3 className="font-medium text-gray-900 mb-4">{t("ui.category.selectCategory")}</h3>
        <p className="text-sm text-gray-500 mb-4">{t("ui.category.selectCategoryDescription")}</p>
        
        {/* Selected Path Display */}
        {getSelectedPath() && (
          <div className="mb-4">
            <Badge variant="outline" className="text-sm">
              {t("ui.category.selectedCategory").replace("{path}", getSelectedPath())}
            </Badge>
          </div>
        )}

        {/* Horizontal Layout for Dropdowns */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Level 1 Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t("ui.category.mainCategory")} *</label>
            <Select value={selectedLevels.level1 || ""} onValueChange={handleLevel1Change}>
              <SelectTrigger>
                <SelectValue placeholder={t("ui.category.mainCategoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.level1.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryName(category, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level 2 Dropdown */}
          {selectedLevels.level1 && availableOptions.level2.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t("ui.category.subCategory")}</label>
              <Select value={selectedLevels.level2 || ""} onValueChange={handleLevel2Change}>
                <SelectTrigger>
                  <SelectValue placeholder={t("ui.category.subCategoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.level2.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Level 3 Dropdown */}
          {selectedLevels.level2 && availableOptions.level3.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t("ui.category.subSubCategory")}</label>
              <Select value={selectedLevels.level3 || ""} onValueChange={handleLevel3Change}>
                <SelectTrigger>
                  <SelectValue placeholder={t("ui.category.subSubCategoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.level3.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
