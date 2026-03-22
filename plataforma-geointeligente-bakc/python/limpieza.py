import pandas as pd
import os
import logging
import argparse
import json

VERBOSE = False

def p(msg: str):
    if VERBOSE:
        print(msg)

def configurar_logger(output_folder: str, base_name: str):
    os.makedirs(output_folder, exist_ok=True)
    log_path = os.path.join(output_folder, f"{base_name}.log")
    logging.basicConfig(
        filename=log_path,
        filemode="a",
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    logging.info("Iniciando validación y limpieza de datos")

def validar_rango(df, col, min_val, max_val):
    flag_col = f"bad_{col}_range"
    df[col] = pd.to_numeric(df[col], errors="coerce")
    df[flag_col] = df[col].isna() | (df[col] < min_val) | (df[col] > max_val)
    return df

def validar_referencia(df, col, csv_ref_file, ref_folder, col_ref_idx=0):
    flag_col = f"bad_{col}_ref"
    ref_path = os.path.join(ref_folder, csv_ref_file)
    if not os.path.exists(ref_path):
        logging.warning(f"No se encontró {ref_path}. Se omite validación de {col}.")
        df[flag_col] = False
        return df
    ref_df = pd.read_csv(ref_path, header=None, dtype=str)
    ref_df[col_ref_idx] = ref_df[col_ref_idx].astype(str).str.strip()
    valid_set = set(ref_df[col_ref_idx].dropna())
    df[col] = df[col].astype(str).str.strip()
    df[flag_col] = ~df[col].isin(valid_set)
    return df

def imputar_nulos(df, imputacion_nulos):
    for col, valor in imputacion_nulos.items():
        if col in df.columns:
            nulos = df[col].isna() | (df[col] == "")
            if f"bad_{col}_ref" in df.columns:
                nulos = nulos | df[f"bad_{col}_ref"]
            df[f"null_{col}"] = nulos
            if nulos.any():
                if valor == "mediana" and col.lower() == "edad":
                    df.loc[nulos, col] = pd.to_numeric(df[col], errors="coerce").median()
                else:
                    df.loc[nulos, col] = valor
        else:
            df[f"null_{col}"] = False
    return df

def manejar_duplicados(df, col="IdEgreso"):
    df[col] = pd.to_numeric(df[col], errors="coerce")
    max_id = df[col].max(skipna=True)
    if pd.isna(max_id):
        max_id = 0
    detalles_eliminados = []
    detalles_reasignados = []
    # 1) Duplicados exactos
    duplicados_exactos = df[df.duplicated(keep='first')]
    for idx in duplicados_exactos.index:
        detalles_eliminados.append(df.loc[idx].to_dict())
    df = df.drop_duplicates(keep="first")
    # 2) Duplicados de ID con datos distintos
    duplicados_id = df[df.duplicated(subset=[col], keep=False)]
    if not duplicados_id.empty:
        for idx in duplicados_id.index[1:]:
            viejo_id = df.at[idx, col]
            max_id += 1
            df.at[idx, col] = max_id
            detalles_reasignados.append((viejo_id, max_id, df.loc[idx].to_dict()))
    # Mensajes solo si verbose
    if detalles_eliminados:
        p(f"Se eliminaron {len(detalles_eliminados)} duplicados exactos.")
        logging.warning(f"{len(detalles_eliminados)} duplicados exactos eliminados")
    if detalles_reasignados:
        p(f"Se reasignaron {len(detalles_reasignados)} IDs duplicados.")
        logging.warning(f"{len(detalles_reasignados)} IDs duplicados reasignados")
    if not detalles_eliminados and not detalles_reasignados:
        p("No se encontraron duplicados.")
        logging.info("No se encontraron duplicados")
    return df, detalles_eliminados, detalles_reasignados

def generar_reporte(df, file_path, output_folder, detalles_eliminados=None, detalles_reasignados=None):
    TARGET_NAMES = [
        "IdEgreso", "Ingreso", "Egreso", "DiasEstancia", "Edad", "IdSexo", "IdDerechohab",
        "IdEntidad", "IdMunicipio", "ClaveLoc", "IdServicioIngreso", "IdServicioEgreso",
        "IdProcedencia", "IdMotivoEgreso", "IdAfecPrincipal", "IdVez"
    ]
    reporte = []
    nombre = os.path.basename(file_path)
    reporte.append("Reporte de validación: " + nombre)
    reporte.append("="*50)
    for col in TARGET_NAMES:
        nulls = df[f"null_{col}"].sum() if f"null_{col}" in df.columns else 0
        ref = df[f"bad_{col}_ref"].sum() if f"bad_{col}_ref" in df.columns else 0
        rango = df[f"bad_{col}_range"].sum() if f"bad_{col}_range" in df.columns else 0
        if nulls or ref or rango:
            reporte.append(f"{col}: nulos={nulls}, ref_inválidos={ref}, fuera_rango={rango}")
    if detalles_eliminados:
        reporte.append(f"Duplicados exactos eliminados: {len(detalles_eliminados)}")
    if detalles_reasignados:
        reporte.append(f"IDs duplicados reasignados: {len(detalles_reasignados)}")
    report_file = os.path.join(output_folder, f"reporte_{os.path.basename(file_path)}.txt")
    with open(report_file, "w", encoding="utf-8") as f:
        f.write("\n".join(reporte))
    p(f"Reporte generado: {report_file}")

def construir_resumen_json(df, detalles_eliminados, detalles_reasignados, out_file):
    TARGET_NAMES = [
        "IdEgreso", "Ingreso", "Egreso", "DiasEstancia", "Edad", "IdSexo", "IdDerechohab",
        "IdEntidad", "IdMunicipio", "ClaveLoc", "IdServicioIngreso", "IdServicioEgreso",
        "IdProcedencia", "IdMotivoEgreso", "IdAfecPrincipal", "IdVez"
    ]
    nulls = {}
    bad_ref = {}
    bad_range = {}

    for col in TARGET_NAMES:
        if f"null_{col}" in df.columns:
            nulls[col] = int(df[f"null_{col}"].sum())
        if f"bad_{col}_ref" in df.columns:
            bad_ref[col] = int(df[f"bad_{col}_ref"].sum())
        if f"bad_{col}_range" in df.columns:
            bad_range[col] = int(df[f"bad_{col}_range"].sum())

    total_nulls = sum(nulls.values())
    total_bad_ref = sum(bad_ref.values())
    total_bad_range = sum(bad_range.values())
    exact = len(detalles_eliminados or [])
    reasg = len(detalles_reasignados or [])

    messages = []
    if exact > 0:
        messages.append(f"Se eliminaron {exact} duplicados exactos")
    if reasg > 0:
        messages.append(f"Se reasignaron {reasg} IDs duplicados")
    if total_nulls > 0:
        messages.append(f"Se detectaron {total_nulls} valores nulos (imputados/marcados)")
    if total_bad_ref > 0:
        messages.append(f"Se detectaron {total_bad_ref} referencias inválidas")
    if total_bad_range > 0:
        messages.append(f"Se detectaron {total_bad_range} valores fuera de rango")
    if not messages:
        messages.append("No se encontraron duplicados ni errores de validación")

    return {
        "ok": True,
        "rows": int(len(df)),
        "duplicatesExact": exact,
        "duplicatesReassigned": reasg,
        "totals": {
            "nulls": total_nulls,
            "badRef": total_bad_ref,
            "badRange": total_bad_range
        },
        "byColumn": {
            "nulls": nulls,
            "badRef": bad_ref,
            "badRange": bad_range
        },
        "cleanOutput": out_file,
        "messages": messages
    }

def procesar_archivo(file_path, ref_folder, output_folder, no_report=False):
    TARGET_NAMES = [
        "IdEgreso", "Ingreso", "Egreso", "DiasEstancia", "Edad", "IdSexo", "IdDerechohab",
        "IdEntidad", "IdMunicipio", "ClaveLoc", "IdServicioIngreso", "IdServicioEgreso",
        "IdProcedencia", "IdMotivoEgreso", "IdAfecPrincipal", "IdVez"
    ]
    REFERENCIAS = {
        "IdSexo": ("Sexo.csv", 0),
        "IdDerechohab": ("DerHab.csv", 0),
        "IdEntidad": ("Entidades.csv", 0),
        "IdMunicipio": ("Municipios.csv", 0),
        "ClaveLoc": ("Localidades.csv", 2),
        "IdServicioIngreso": ("Servicios.csv", 0),
        "IdServicioEgreso": ("Servicios.csv", 0),
        "IdProcedencia": ("Proced.csv", 0),
        "IdMotivoEgreso": ("MotivoEgreso.csv", 0),
        "IdAfecPrincipal": ("AfecPrin.csv", 2)
    }
    VALID_RANGES = {"Edad": (0, 120), "DiasEstancia": (0, 365)}
    IMPUTACION_NULOS = {
        "Edad": "mediana",
        "IdSexo": 9,
        "IdDerechohab": 0,
        "IdEntidad": 99,
        "IdMunicipio": 0,
        "ClaveLoc": 999,
        "IdServicioIngreso": 501,
        "IdServicioEgreso": 501,
        "IdProcedencia": 9,
        "IdMotivoEgreso": 9
    }

    nombre = os.path.basename(file_path)
    logging.info(f"Procesando archivo: {nombre}")
    p(f"Procesando {nombre}")
    try:
        df = pd.read_csv(file_path, dtype=str)

        for col in TARGET_NAMES:
            if col not in df.columns:
                df[col] = None
        df = df[TARGET_NAMES]
        logging.info(f"Archivo cargado: {len(df)} registros")

        for col, (min_val, max_val) in VALID_RANGES.items():
            if col in df.columns:
                df = validar_rango(df, col, min_val, max_val)
        logging.info("Validación de rangos completada")

        for col, (ref_file, ref_col_idx) in REFERENCIAS.items():
            if col in df.columns:
                df = validar_referencia(df, col, ref_file, ref_folder, ref_col_idx)
        logging.info("Validación de referencias completada")

        df = imputar_nulos(df, IMPUTACION_NULOS)
        logging.info("Imputación de nulos completada")

        df, detalles_eliminados, detalles_reasignados = manejar_duplicados(df, "IdEgreso")
        logging.info("Manejo de duplicados completado")

        df_out = df[TARGET_NAMES].copy()
        out_file = os.path.join(output_folder, f"validado_{nombre}")
        df_out.to_csv(out_file, index=False, encoding="utf-8")
        logging.info(f"Archivo limpio guardado: {out_file}")
        p(f"Archivo limpio guardado: {out_file}")

        if not no_report:
            generar_reporte(df, file_path, output_folder, detalles_eliminados, detalles_reasignados)
            logging.info(f"Reporte generado para {nombre}")

        summary = construir_resumen_json(df, detalles_eliminados, detalles_reasignados, out_file)
        return True, summary
    except Exception as e:
        logging.error(f"Error procesando {nombre}: {e}")
        p(f"Error procesando {nombre}: {e}")
        return False, {"ok": False, "error": str(e)}

def main():
    global VERBOSE
    parser = argparse.ArgumentParser(description="Limpieza y validación de CSV de Registro Médico")
    parser.add_argument("--input", "-i", required=True, help="Ruta del archivo CSV de entrada")
    parser.add_argument("--output", "-o", required=True, help="Carpeta de salida para el CSV limpio")
    parser.add_argument("--ref", "-r", required=False, default="Tablas de las FK", help="Carpeta con tablas de referencia")
    parser.add_argument("--emit-json", action="store_true", default=False, help="Emite un resumen JSON por stdout")
    parser.add_argument("--no-report", action="store_true", default=False, help="No generar archivo de reporte .txt")
    parser.add_argument("--enable-log", action="store_true", default=False, help="Habilitar logging a archivo")
    parser.add_argument("--verbose", action="store_true", default=False, help="Imprimir mensajes en consola")
    args = parser.parse_args()

    VERBOSE = args.verbose

    input_csv = os.path.abspath(args.input)
    output_folder = os.path.abspath(args.output)
    ref_folder = os.path.abspath(args.ref)

    base_name = os.path.splitext(os.path.basename(input_csv))[0]
    if args.enable_log:
        configurar_logger(output_folder, base_name)

    ok, summary = procesar_archivo(input_csv, ref_folder, output_folder, no_report=args.no_report)
    if not ok:
        if args.emit_json:
            print(json.dumps(summary, ensure_ascii=False))
        exit(1)

    if args.emit_json:
        print(json.dumps(summary, ensure_ascii=False))
    else:
        p("Proceso completado. Revisa la carpeta de salida.")

if __name__ == "__main__":
    main()