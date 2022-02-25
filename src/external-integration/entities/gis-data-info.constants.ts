export const gisDataInfo = {
  soilUsage: {
    url: 'https://esigr.recife.pe.gov.br/arcgis/rest/services/Financas/Base_Lotes_Limites/MapServer/0/query',
    fields:
      'OBJECTID,SITUACAOIMOVEL,ENDNUMERO,AREALOTE,AREATOTALCONSTRUIDA,QTDPAVIMENTOS,TIPOEMPREENDIMENTO,TESTADAPRINCIPAL,DSQFL,NMEDIFICACAO,ANCONSTR,QTDMULTIPLAS,QTDUNHAB,NMENDCOMP,SHAPE,TLOTESULAT,NMTIPOEMPRENDIMENTO,EFTUTZDESC,DB2GSE.ST_Area(SHAPE),DB2GSE.SdeLength(SHAPE)'
  },
  builtAreas: {
    url: 'https://esigr.recife.pe.gov.br/arcgis/rest/services/Financas/Levantamento_ENGEFOTO/MapServer/1/query',
    fields:
      'OBJECTID,DSQFL,MAX_PAVIME,FIRST_LAYE,USO,SHAPE,VLAREACAD,VLAREAENGEF,NMENDCOMP'
  },
  trees: {
    url: 'https://esigportal2.recife.pe.gov.br/arcgis/rest/services/MeioAmbiente/MA_PontosArvores/FeatureServer/0/query',
    fields:
      'objectid,tipo_ponto,porte_esp,bairro,rpa,nome_popul,categoria_,obs,created_us,created_da,last_edite,last_edi_1,tipologia,idlote,origem,apermeavel,caracsolo,fiacaohorz,redesubter,postetrans,posteilumi,cruzamvias,eqpeqporte,rusticidad,processo,nomecientifico,execucao,copa,altura,cap,dap,dataplantio,resptecnico,datamonito,invalidacao,injuria,fitossanidade,created_user,created_date,last_edited_user,last_edited_date,nome_comum,nome_sp,globalid,projeto,responsavel,contato,altfuste'
  }
}
