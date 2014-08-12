using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Research.Nlp;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json.Linq;

namespace Component
{
    public sealed class RootObject
    {
        public string Key { get; set; }
        public IList<AnalyzedWord> Value { get; set; }
    
    }
    public sealed class DataBase
    {
        public IList<NodesData> nodes { get; set; }
        public IList<LinksData> links { get; set; }

        public DataBase()
        {
            this.nodes = new List<NodesData>();
            this.links = new List<LinksData>();
        }
    }
    public sealed class NodesData
    {
        //public int ID { get; set; }
        public string word { get; set; }
        public int state { get; set; } //0--unpined 1--pined 2--connected
        public int frequency { get; set; }
    }
    public sealed class LinksData
    {
        public string linkName { get; set; }
        public int source { get; set; }
        public int target { get; set; }
    }
    public sealed class AnalyzedWord
    {
        public string Parent { get; set; }
        public string Tag { get; set; }
        public string Word { get; set; }
    }
    public sealed class SampleComponent
    {
        //string [] args = new String[] {"C:\\Users\\v-xime\\Documents\\Visual Studio 2013\\Projects\\NoteProject\\NoteProject\\bin\\Debug\\AppX\\Models","en-Chunker,en-Tokens,en-POS_Tags,en-Constituency_Tree,en-Dependency_Tree,en-Lemmas,en-Named_Entities,en-"};
        string[] args = new String[] { "C:\\Users\\v-xime\\Documents\\Visual Studio 2013\\Projects\\NoteProject\\NoteProject\\bin\\Debug\\AppX\\Models", "en-Dependency_Tree" };
        string results;
        string resultJson = null;
        
        public string GetResultJson(string input)
        {
            //Msr.Nlp.SplatDrop.ConsoleProgram.Main(args);
            //var h = InitAnalysisHost(args);
            //UsingEnglishAnalyzers(h, input);
            System.Diagnostics.Debug.WriteLine("000000" + input);
            CallSplatJsonService(input);

            resultJson = null;

            while (true)
            {
                if (this.resultJson != null) break;
            }
            return this.resultJson;
        }

        public void InitialAnalysis(RootObject rootObject)
        {
            DataBase database = new DataBase();           
            int i = 0;
            foreach (var obj in rootObject.Value)
            {
                if(obj.Tag == "NNP" || obj.Tag == "NN")
                {
                    Boolean flag = true;
                    foreach (var node in database.nodes)
                    {
                        if (node.word.ToUpper() == obj.Word.ToUpper())
                        {
                            node.frequency++;
                            flag = false;
                            break;
                        }
                    }
                    if(flag)
                    {
                        NodesData tmp = new NodesData();
                        //tmp.index = i;
                        tmp.word = obj.Word;
                        tmp.state = 0;
                        tmp.frequency = 1;
                        //System.Diagnostics.Debug.WriteLine("duck");
                        database.nodes.Add(tmp);
                        i++;
                    }
                }
            }
            System.Diagnostics.Debug.WriteLine(database.nodes.Count);
            var dataBaseJson = JsonConvert.SerializeObject(database);
            System.Diagnostics.Debug.WriteLine("dataBaseJson: "+dataBaseJson);
            resultJson = dataBaseJson;
        }
        public string CallSplatJsonService(string input)
        {
            var requestStr = String.Format("http://msrsplat.cloudapp.net/SplatServiceJson.svc/Analyzers?language={0}&json=x", "en");

            string language = "en";
            //string input = "I live in Seattle";
            string analyzerList = "Dependency_Tree";
            string appId = "7623AD23-A9B2-423A-848D-D814F49AE07D";

            string requestAnanlyse = String.Format("http://msrsplat.cloudapp.net/SplatServiceJson.svc/Analyze?language={0}&analyzers={1}&appId={2}&json=x&input={3}",
       language, analyzerList, appId, input);

            var request = HttpWebRequest.Create(requestAnanlyse);
            request.ContentType = "application.json; charset=utf-8";
            request.Method = "GET";
            request.BeginGetResponse(new AsyncCallback(ReadWebRequestCallback), request);         
            return this.results;
        }
        private void ReadWebRequestCallback(IAsyncResult callbackResult)
        {
            
            HttpWebRequest myRequest = (HttpWebRequest)callbackResult.AsyncState;
            using (HttpWebResponse myResponse = (HttpWebResponse)myRequest.EndGetResponse(callbackResult))
            {
                using (StreamReader httpwebStreamReader = new StreamReader(myResponse.GetResponseStream()))
                {
                    this.results = httpwebStreamReader.ReadToEnd().ToString(); 
                    System.Diagnostics.Debug.WriteLine("111111"+this.results);
                    this.results = this.results.Remove(0, 1);
                    this.results = this.results.Substring(0, this.results.Length - 1);
                    this.results = this.results.Replace("[[","[");
                    this.results = this.results.Replace("]]", "]");
                    this.results = this.results.Replace("],[", ",");
                    System.Diagnostics.Debug.WriteLine("After changed:" + this.results);
                    AnalyzeJsonData(this.results);
                }
            }
        } 
        private void AnalyzeJsonData(string json)
        {
            System.Diagnostics.Debug.WriteLine("22222");
            var rootObject = JsonConvert.DeserializeObject<RootObject>(json);
            System.Diagnostics.Debug.WriteLine("33333" + rootObject.Value.Count);
            InitialAnalysis(rootObject);
            
        }
        //private IAnalysisHost InitAnalysisHost(string[] args)
        //{
        //    IAnalysisHost h;
        //    string modelDir = null;
        //    var splatAnalyzers = new List<string>();
        //    //modelDir = args.Length != 0 ? args[0] : Environment.GetEnvironmentVariable("SPLAT_MODEL_DIR");
        //    modelDir = args[0];
        //    if (string.IsNullOrEmpty(modelDir))
        //    {
        //        throw new ArgumentException("Model Directory needs to be set for SPLAT to initialize.\n Pass the Model Directory as the first argument or set Environment variable SPLAT_MODEL_DIR");
        //    }
        //    //Console.WriteLine("Environment variable SPLAT_MODEL_DIR is: " + modelDir);

        //    if (args.Length > 1)
        //    {
        //        splatAnalyzers = args[1].Split(new char[] { ';', ',' }).ToList();
        //        //string[] splatAnalyzers = new string[] { "Chunker", "Constituency_Tree", "Dependency_Tree", "Katakana_Transliterator", "Lemmas", "Named_Entities", "POS_Tags", "Semantic_Roles", "Sentiment", "Stemmer", "Tokens", "Triples" };                            
        //        //splatAnalyzers.Add("BaseForms");
        //    }
        //    h = HostFactory.CreateHost(modelDir, splatAnalyzers);
        //    //Console.WriteLine("Finished loading models for SPLAT.");
        //    return h;
        //}

        //private void UsingEnglishAnalyzers(IAnalysisHost h, string input)
        //{
        //    var line = input;
        //    var b = h.CreateAnalysis("en", line);
        //    int count = 0;
        //    System.Diagnostics.Debug.WriteLine("test");
        //    foreach (var an in h.Analyzers("en"))
        //    {
        //        count ++;
        //        if (count == 4)
        //        {
        //            System.Diagnostics.Debug.WriteLine("    " + an);
        //            var output = b.Demand(new AnalysisName(an));
        //            System.Diagnostics.Debug.WriteLine(output);
        //            break;
        //        }

        //    }
        //}
    }
}
