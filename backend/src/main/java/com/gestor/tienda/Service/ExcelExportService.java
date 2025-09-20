package com.gestor.tienda.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gestor.tienda.Entity.MovimientoStock;
import com.gestor.tienda.Repository.MovimientoStockRepository;

@Service
public class ExcelExportService {

    @Autowired
    private MovimientoStockRepository movimientoStockRepository;

    public ByteArrayInputStream exportarMovimientos() throws IOException {
        String[] columnas = {"ID Movimiento", "Tipo", "Talle", "Cantidad", "Fecha",
                "ID Producto", "Nombre Producto", "Marca", "Color", "Precio"};

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Movimientos Stock");

            // Estilo para encabezado
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Estilo para fecha
            CellStyle dateStyle = workbook.createCellStyle();
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy HH:mm"));

            // Estilo para precio
            CellStyle priceStyle = workbook.createCellStyle();
            priceStyle.setDataFormat(createHelper.createDataFormat().getFormat("#,##0.00"));

            // Crear fila de encabezados
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }

            // Congelar encabezado y habilitar autofiltro
            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new CellRangeAddress(0, 0, 0, columnas.length - 1));

            // Obtener datos
            List<MovimientoStock> movimientos = movimientoStockRepository.findAll();
            int rowIdx = 1;

            for (MovimientoStock mov : movimientos) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(mov.getId());
                row.createCell(1).setCellValue(mov.getTipoMovimiento());
                row.createCell(2).setCellValue(mov.getTalle());
                row.createCell(3).setCellValue(mov.getCantidad());

                Cell fechaCell = row.createCell(4);
                fechaCell.setCellValue(mov.getFecha());
                fechaCell.setCellStyle(dateStyle);

                if (mov.getProducto() != null) {
                    row.createCell(5).setCellValue(mov.getProducto().getId());
                    row.createCell(6).setCellValue(mov.getProducto().getNombre());
                    row.createCell(7).setCellValue(mov.getProducto().getMarca());
                    row.createCell(8).setCellValue(mov.getProducto().getColor());

                    Cell precioCell = row.createCell(9);
                    precioCell.setCellValue(mov.getProducto().getPrecio().doubleValue());
                    precioCell.setCellStyle(priceStyle);
                }
            }

            // Ajustar ancho de columnas automáticamente
            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
