%=============Problema Centrales Eléctricas=================

%===================David Alberto Guzmán    - 1942789
%===================Diego Fernando Chaverra - 1942789
%===================Faver Agustín Granja    - 1910205

%===================Modelo genérico========================
%==========================================================
%==========================================================
%==================Lectura de datos========================
%==========================================================
%==========================================================

int: n; %Cantidad de días

int: m; %Cantidad de Clientes

int: capN; %Máxima capacidad de produción diaria en MW para central Nuclear
int: capH; %Máxima capacidad de produción diaria en MW para central Hidroelétrica
int: capT; %Máxima capacidad de produción diaria en MW para central Termica

int: cosN; %Costo de producir MW para la central Nuclear
int: cosH; %Costo de producir MW para la central Hidroeléctrica
int: cosT; %Costo de producir MW para la central Térmica

%array [int, int] of int:d;
array [1..m, 1..n] of int:d; %matriz de demanda diaria por cada cliente m en un dia n

int: G; %Requerimiento minimo si la demanda diaria en un dia n, supera la capacida de procucion de las tres cebtrales (capN+capH+capT)

array[1..m] of int: P; %pago individual por cada cliente

%==========================================================
%==========================================================
%=========================Variables========================
%==========================================================
%==========================================================

array [1..n] of var 0..capN: pdN; %Produción de la central Nuclear en un dia n
array [1..n] of var 0..capH: pdH; %Produción de la central Hidroeléctrica en un dia n
array [1..n] of var 0..capT: pdT; %Produción de la central Térmica en un dia n

array [1..m, 1..n] of var 0..(capN+capH+capT):pmC; %Producion máxima dada a cada clientes
array [1..m, 1..n] of var int:gpC; %Ganancia obtenida por cada cliente m en un día n

var int: PH; %Representa la ganancia por producccion en un horizonte n

%==========================================================
%==========================================================
%=======================Resticiones========================
%==========================================================
%==========================================================

constraint forall (s in 1..m,i in 1..n)(
     (pmC[s,i])<=(d[s,i])
);

constraint forall (s in 1..m,i in 1..n)(
     (pmC[s,i])>=d[s,i]*G div 100
);

constraint forall (i in 1..n)(
    sum(s in 1..m)(pmC[s,i])<= (capN+capH+capT)
);

constraint forall (i in 1..n)(
    sum (s in 1..m)(pmC[s,i]) <= (pdN[i]+pdH[i]+pdT[i])
);

constraint forall (i in 1..n)(
   pdN[i] <= capN
);

constraint forall (i in 1..n)(
   pdH[i] <= capH
);

constraint forall (i in 1..n)(
   pdT[i] <= capT
);

%==========================================================
%==========================================================
%=====================No Negatividad=======================
%==========================================================
%==========================================================


constraint PH >= 0;
constraint n >= 0;
constraint m >= 0;
constraint G >= 0;
constraint cosN >= 0;
constraint cosH >= 0;
constraint cosT >= 0;
constraint capN >= 0;
constraint capH >= 0;
constraint capT >= 0;
constraint forall (s in 1..m)(
  P[s] >= 0
);
constraint forall (s in 1..m,i in 1..n) (
  d[s,i] >= 0
);
constraint forall (s in 1..m,i in 1..n) (
  gpC[s,i] >= 0
);

%==========================================================
%==========================================================
%====================Función Objetivo======================
%==========================================================
%==========================================================

constraint PH = sum(i in 1..n)(
   (sum (s in 1..m)(P[s]*pmC[s,i]))-
          (cosN*pdN[i]+cosH*pdH[i]+cosT*pdT[i])
);  

constraint forall (s in 1..m,i in 1..n) (
  gpC[s,i] = (P[s]*pmC[s,i])
);



solve maximize PH;

output["Produccion Entregada a Cliente: \n",show(pmC),"\n"];
output["Demanda: \n", show(d),"\n"];
output["Produccion Central Nuclear: \n",show(pdN),"\n"];
output["Produccion Central Hidroeléctrica: \n",show(pdH),"\n"];
output["Produccion Central Térmica: \n",show(pdT),"\n"];
output["Ganancia obtenida por cada cliente en cada día: \n", show(gpC), "\n"];
output["Funcion Objetivo: \n",show(PH)];