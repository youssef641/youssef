import React,{ useState ,useEffect}  from "react";
import {
  Grid,
  Typography
 
} from "@material-ui/core";



// components

import MUIDataTable from "mui-datatables";
import useStyles from "../login/styles"
import jwt_decode from "jwt-decode";
import PageTitle from "../../components/PageTitle";
import {getAll} from"../../context/UserContext";


export default function Dashboard(props) {
  var classes = useStyles();
  var [error, setError] = useState("");
  var [data,SetData]= useState();
  const token = localStorage.getItem('token');
  var user = jwt_decode(token)
  useEffect(() => {
    getAll(setError,SetData,user.sass);
  
  }, []);
  const options = {
   
    filterType: "dropdown",
   
   
    onTableChange: (action, state) => {
      console.log(action);
      console.dir(state);
    }
  };
  
  return (
    <>
      <PageTitle title="Dashboard" button="Latest Reports" />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          
        <Typography color="secondary" className={classes.errorMessage}>
                {error}
                </Typography>
                
          <MUIDataTable
            title="Employee List"
            data={data}
            columns={["nom", "prenom","email", "departement", "startDate"]}
            options={{
              options }}
          />
        </Grid>
        
      </Grid>
    </>
  );
}



