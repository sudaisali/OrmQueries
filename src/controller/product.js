const { ProductLine } = require('../models/productLines')
const { Product } = require('../models/product')
const { Order } = require('../models/order')
const { Customer } = require('../models/customer')
const { Payment } = require('../models/payment')
const {OrderDetail} = require('../models/orderDetail')
const {Employee} = require('../models/employee')
const {Office} = require('../models/office')
const Sequelize = require('sequelize')
const { fn, col, literal, Op} = Sequelize


async function productInfo(req, res) {
  const page = parseInt(req.query.page) || 1;
  const pageLimit = 10;

  try {
      const totalCount = await Product.count();
      const productData = await Product.findAll({
          attributes: ['productName', 'productLine'],
          offset: (page - 1) * pageLimit,
          limit: pageLimit
      });

      if (!productData || productData.length === 0) {
        handleErrorResponse(res, 'Sorry, no data exists for this page', totalCount, page, pageLimit);
      } else {
          const totalPages = Math.ceil(totalCount / pageLimit);
          const nextPage = page < totalPages ? `api/productinfo?page=${page + 1}` : null;
          const prevPage = page > 1 ? `api/productinfo?page=${page - 1}` : null;

          handleSuccessResponse(res, productData, totalCount, totalPages, page, nextPage, prevPage);
      }
  } catch (error) {
    handleErrorResponse(res, 'Failed', error.message, null, null);
  }
}
async function customerOrder(req, res) {
  try {
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalCount = await Order.count();
      
      const productData = await Order.findAll({
          attributes: [
              'customerNumber',
              [Sequelize.fn('COUNT', Sequelize.col('customerNumber')), 'TotalOrders']
          ],
          group: ['customerNumber'],
          order: [[Sequelize.literal('TotalOrders'), 'DESC']],
          offset: (page - 1) * pageLimit,
          limit: pageLimit
      });

      if (!productData || productData.length === 0) {
        handleErrorResponse(res, "Sorry, no data exists for this page", totalCount, page, pageLimit);
      } else {
          const totalPages = Math.ceil(totalCount / pageLimit);
          const nextPage = page < totalPages ? `api/customerOrder?page=${page + 1}` : null;
          const prevPage = page > 1 ? `api/customerOrder?page=${page - 1}` : null;

          handleSuccessResponse(res, productData, totalCount, totalPages, page, nextPage, prevPage);
      }
  } catch (error) {
      console.error(error);
      handleErrorResponse(res, "Internal Server Error", null, null, null);
  }
}
async function customerTotalPayment(req, res) {
  try {
    

      const result = await Customer.findAll({
          attributes: [
              'customerNumber',[Sequelize.fn('SUM', Sequelize.col('Payments.amount')), 'totalPayment']
              
          ],
          include: [{
              model: Payment,
              attributes: [],
              required: false
          }],
          group: ['customerNumber'],
      });
      

      if (!result || result.length === 0) {
          handleErrorResponse(res, 'No data found for total payments', null);
      }  else {
          
        const totalCount = result.length;
        const page = parseInt(req.query.page) || 1;
        const pageLimit = 10;
        const totalPages = Math.ceil(totalCount / pageLimit);
        const nextPage = page < totalPages ? `api/productNameandOrderedNo?page=${page + 1}` : null;
        const prevPage = page > 1 ? `api/productNameandOrderedNo?page=${page - 1}` : null;

        const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

          handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
      }
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, "Internal Server Error", null, null, null);
  }
}
async function productNameandOrderedNo(req, res) {
  try {
      

      const result = await Product.findAll({
        attributes:[
            'ProductName',
            [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT `orderNumber`')), 'OrderCount']
        ],
        include:[{
            model: OrderDetail,
            as : 'OrderDetails',
            attributes:[]
        }],
        group:['ProductName'],
        order: [[Sequelize.literal('OrderCount'), 'DESC']],
        
        
    })

      if (!result || result.length === 0) {
          handleErrorResponse(res, 'No data found for product orders', null);
      } else {
          
        const totalCount = result.length;
        const page = parseInt(req.query.page) || 1;
        const pageLimit = 10;
        const totalPages = Math.ceil(totalCount / pageLimit);
        const nextPage = page < totalPages ? `api/productNameandOrderedNo?page=${page + 1}` : null;
        const prevPage = page > 1 ? `api/productNameandOrderedNo?page=${page - 1}` : null;

        const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

          handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
      }
  } catch (error) {
      console.error(error);
      handleErrorResponse(res, 'Failed', error.message);
  }
}
const getEmployeesWithoutCustomers = async (req, res) => {
  // Display the names of employees who have not been assigned to any customers.
  try {
    const result = await Employee.findAll({
      attributes: ['firstName', 'lastName', 'employeeNumber'],
      include: [{
          model: Customer,
          attributes: [],
          required: false,

      }],
      where: {
          '$Customers.salesRepEmployeeNumber$': null 
      }
  });

      if (!result || result.length === 0) {
          handleErrorResponse(res, 'No employees found without customers', null, null, null);
      } else {
          const totalCount = result.length;
          const page = parseInt(req.query.page) || 1;
          const pageLimit = 10;
          const totalPages = Math.ceil(totalCount / pageLimit);
          const nextPage = page < totalPages ? `api/getEmployeesWithoutCustomers?page=${page + 1}` : null;
          const prevPage = page > 1 ? `api/getEmployeesWithoutCustomers?page=${page - 1}` : null;

          const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

          handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
      }
  } catch (error) {
      console.error('Error:', error);
      handleErrorResponse(res, 'Failed', error.message, null, null);
  }
}
const getCustomersWithOrderCount = async (req, res) => {
  try {
      const result = await Customer.findAll({
          attributes: [
              'customerName',
              [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Orders.orderNumber'))), 'orderCount']
          ],
          include: [{
              model: Order,
              attributes: [],
              include: [{
                  model: OrderDetail,
                  attributes: [],
              }],
              as: 'Orders',
          }],
          group: ['Customer.customerName'],
          having: Sequelize.literal('COUNT(DISTINCT Orders.orderNumber) > 0'),
          
      });

      if (!result || result.length === 0) {
          handleErrorResponse(res, 'No customers found with orders', null);
      }else {
        const totalCount = result.length;
        const page = parseInt(req.query.page) || 1;
        const pageLimit = 10;
        const totalPages = Math.ceil(totalCount / pageLimit);
        const nextPage = page < totalPages ? `api/getCustomersWithOrderCount?page=${page + 1}` : null;
        const prevPage = page > 1 ? `api/getCustomersWithOrderCount?page=${page - 1}` : null;

        const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

        handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
    }
  } catch (error) {
      console.error('Error:', error);
      handleErrorResponse(res, 'Failed', error.message);
  }
}
const getAveragePaymentAmount = async(req,res)=>{
  try {
    const result = await Customer.findAll({
      attributes: [
          [fn('AVG', literal('payments.amount')), 'averagePayment'],
          'city'
      ],
      include: [{
          model: Payment,
          attributes: [],
          required: false,
      }],
      group: ['city'],
      having: {
        averagePayment: {
            [Op.gt]: 1000
        },
        
    }
     
  });

    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No customers found with orders', null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/getAveragePaymentAmount?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/getAveragePaymentAmount?page=${page - 1}` : null;

      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const orderandorderdetails = async(req,res)=>{
  try {
    const result = await Product.findAll({
      attributes: [
          'productName',
          [fn('SUM', col('OrderDetails.quantityOrdered')), 'totalQuantityOrdered']
      ],
      include: [{
          model: OrderDetail,
          as: 'OrderDetails',
          attributes: [],
          required: true
      }],
      group: ['productName']
  });

    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No customers found with orders', null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/getAveragePaymentAmount?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/getAveragePaymentAmount?page=${page - 1}` : null;

      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const getUsaemployeesWithCustomer = async(req,res)=>{
  try {
    const result = await Employee.findAll({
      attributes: [
          [Sequelize.fn('CONCAT', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')), 'EmployeeName']
      ],
      include: [{
          model: Customer,
          attributes: [],
          required: false,
      }, {
          model: Office,
          attributes: [],
          required: true,
          where: {
              country: 'USA'
          }
      }],
      where: {
          '$Customers.salesRepEmployeeNumber$': null
      },
      
  });
  
  

    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No customers found with orders', null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/getAveragePaymentAmount?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/getAveragePaymentAmount?page=${page - 1}` : null;

      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const productOrderedByUsaCustomers = async(req,res)=>{
  try {
    const result = await Product.findAll({
        attributes: [
            'productName',
            [Sequelize.fn('COUNT', Sequelize.col('OrderDetails.productCode')), 'TotalProductOrdered']
        ],
        include: [{
            model: OrderDetail,
            attributes: [],
            include: [{
                model: Order,
                attributes: [],
                required:true,
                include: [{
                    model: Customer,
                    attributes: [],
                    where: {
                        country: 'USA'
                    }
                }]
            }]
        }],
        
        group: ['productName'],
        order: [[Sequelize.literal('TotalProductOrdered'), 'DESC']], 
    });
  
  

    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No customers found with orders', null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/productOrderedByUsaCustomers?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/productOrderedByUsaCustomers?page=${page - 1}` : null;
      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const getTotalRevenueByProductLine = async(req,res)=>{
  try {
    const result = await Product.findAll({
        attributes: [
            'productLine',
            [Sequelize.fn('SUM', Sequelize.literal('quantityOrdered * priceEach')), 'TotalRevenue']
        ],
        include: [
            {
                model: OrderDetail,
                attributes: [],
                required: true, 
            }
        ],
        group: ['productLine']
    });
      
  
  

    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No ProductLine  Found', null,null,null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/productOrderedByUsaCustomers?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/productOrderedByUsaCustomers?page=${page - 1}` : null;
      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const customerwhoplaceorder = async(req,res)=>{
  try {
    const result = await Customer.findAll({
        attributes: [
            'customerName',
            [Sequelize.literal('Orders.orderNumber'), 'orderNumber'],
            [Sequelize.literal('Payments.amount'), 'amount']
        ],
        include: [
            {
                model: Order,
                attributes: [],
                required: true, // INNER JOIN
            },
            {
                model: Payment,
                attributes: [],
                required: true, // INNER JOIN
            }
        ],
        order: ['customerName']
    });
      
  
  

    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No ProductLine  Found', null,null,null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/productOrderedByUsaCustomers?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/productOrderedByUsaCustomers?page=${page - 1}` : null;
      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const EmployeesAssosiatedWithCustomer = async(req,res)=>{
  try {
    const result = await Employee.findAll({
        attributes: ['firstName', 'lastName', 'employeeNumber'],
        include: [
            {
                model: Customer,
                attributes: ['customerName'],
                required: false, 
            }
        ]
    });
      
  
  

    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No ProductLine  Found', null,null,null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/EmployeesAssosiatedWithCustomer?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/EmployeesAssosiatedWithCustomer?page=${page - 1}` : null;
      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const ProductandProductLine = async(req,res)=>{
  try {
    const result = await ProductLine.findAll({
        attributes: ['productLine'],
        include: [
          {
            model: Product,
            attributes: ['productName'],
            required: false, 
          },
        ],
      });
      
  
  

    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No ProductLine  Found', null,null,null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/EmployeesAssosiatedWithCustomer?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/EmployeesAssosiatedWithCustomer?page=${page - 1}` : null;
      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const CustomermadePayments = async(req,res)=>{
  try {
    const result = await Customer.findAll({
        attributes: ['customerName'],
        include: [
          {
            model: Payment,
            attributes: ['amount','paymentDate'],
            required: false, 
          },
        ],
      });
    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No ProductLine  Found', null,null,null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/CustomermadePayments?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/CustomermadePayments?page=${page - 1}` : null;
      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const EmployeeandOffice = async(req,res)=>{
  try {
    const result = await Office.findAll({
        attributes: ['city',[Sequelize.fn('COUNT', Sequelize.col('employeeNumber')), 'employeeCount']],
        
        include: [
          {
            model: Employee,
            attributes: [],
            required: false, 
          },
        ],
        group: ['Office.officeCode'],
      });
    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No ProductLine  Found', null,null,null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/CustomermadePayments?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/CustomermadePayments?page=${page - 1}` : null;
      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const ProductLineandPayment = async(req,res)=>{
  try {
    const result = await ProductLine.findAll({
        attributes: [
          'productLine',
          [Sequelize.fn('SUM', Sequelize.literal('quantityOrdered * priceEach')), 'TotalPayments'],
        ],
        include: [
          {
            model: Product,
            attributes: [],
            include: [
              {
                model: OrderDetail,
                attributes: [],
                required: false, 
              },
            ],
          },
        ],
        group: ['ProductLine.productLine'],
        order: [[Sequelize.literal('TotalPayments'), 'DESC']],
      });
    if (!result || result.length === 0) {
        handleErrorResponse(res, 'No ProductLine  Found', null,null,null);
    }else {
      const totalCount = result.length;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = 10;
      const totalPages = Math.ceil(totalCount / pageLimit);
      const nextPage = page < totalPages ? `api/CustomermadePayments?page=${page + 1}` : null;
      const prevPage = page > 1 ? `api/CustomermadePayments?page=${page - 1}` : null;
      const paginatedResult = result.slice((page - 1) * pageLimit, page * pageLimit);

      handleSuccessResponse(res, paginatedResult, totalCount, totalPages, page, nextPage, prevPage);
  }
} catch (error) {
    console.error('Error:', error);
    handleErrorResponse(res, 'Failed', error.message);
}
}
const updatePrices = async (req,res) => {
    try {
      await Product.update(
        {
          buyPrice: Sequelize.literal(`
            CASE
              WHEN productLine = 'Motorcycles' THEN ROUND(buyPrice * 0.85)
              WHEN productLine = 'Ships' THEN ROUND(buyPrice * 0.80)
              ELSE buyPrice
            END
          `),
        },
        {
          where: {
            productLine: ['Motorcycles', 'Ships'],
          },
        }
      );
  
      res.json({message:'Prices updated successfully.'});
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  };










































































  function handleSuccessResponse(res, productData, totalCount, totalPages, page, nextPage, prevPage) {
    res.json({
        status: "Success",
        productData,
        pagination: {
            totalItems: totalCount,
            totalPages,
            currentPage: page,
            nextPage,
            prevPage
        }
    });
}

function handleErrorResponse(res, message, totalCount, page, pageLimit) {
    res.json({
        status: message,
        productData: [],
        pagination: {
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / pageLimit),
            currentPage: page,
            nextPage: null,
            prevPage: null
        }
    });
}
module.exports = { productInfo , customerOrder  , customerTotalPayment , 
    productNameandOrderedNo , getEmployeesWithoutCustomers,getCustomersWithOrderCount ,
    getAveragePaymentAmount , orderandorderdetails,getUsaemployeesWithCustomer,productOrderedByUsaCustomers,
    getTotalRevenueByProductLine , customerwhoplaceorder , EmployeesAssosiatedWithCustomer,
    ProductandProductLine , CustomermadePayments,EmployeeandOffice,ProductLineandPayment,updatePrices}