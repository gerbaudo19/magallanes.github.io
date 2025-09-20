package com.gestor.tienda.Controller;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestor.tienda.Service.ExcelExportService;

@RestController
@CrossOrigin("*")
public class ExportController {

    @Autowired
    private ExcelExportService excelExportService;

    @GetMapping("/api/movimientos/exportar")
    public ResponseEntity<byte[]> exportarExcel() throws IOException {
        ByteArrayInputStream in = excelExportService.exportarMovimientos();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=movimientos_stock.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(in.readAllBytes());
    }
}
