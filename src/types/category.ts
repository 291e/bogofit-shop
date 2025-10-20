export interface CategoryInfoDto {
  id: string;
  parentId?: string;
  name: string;
  slug: string;
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponseDto extends CategoryInfoDto {
  parent?: CategoryInfoDto;
  children: CategoryInfoDto[];
}

export interface CategoryTreeDto extends CategoryInfoDto {
  children: CategoryTreeDto[];
}

export interface GetCategoriesResponse {
  success: boolean;
  message: string;
  data: CategoryResponseDto[] | CategoryTreeDto[] | CategoryResponseDto | null;
}

export interface GetCategoriesParams {
  status?: string;
  parentId?: string;
  slug?: string;
  id?: string;
  isRoot?: boolean;
  isTree?: boolean;
}
