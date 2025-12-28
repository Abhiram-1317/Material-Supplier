import {Controller, Get, NotFoundException, Param, Query} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {CatalogService} from './catalog.service';
import {QueryProductsDto} from './dto/query-products.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('cities')
  @ApiOkResponse({description: 'List of cities'})
  listCities() {
    return this.catalogService.listCities();
  }

  @Get('categories')
  @ApiOkResponse({description: 'List of product categories'})
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Get('products')
  @ApiOkResponse({description: 'Paginated list of products'})
  listProducts(@Query() query: QueryProductsDto) {
    return this.catalogService.listProducts(query);
  }

  @Get('products/:id')
  @ApiOkResponse({description: 'Product details'})
  async getProduct(@Param('id') id: string) {
    const product = await this.catalogService.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
